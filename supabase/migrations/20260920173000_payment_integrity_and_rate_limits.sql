-- Migration: 20260920173000_payment_integrity_and_rate_limits.sql
-- Description: Adds processed_payment_events for deduplication, rate_limits table & RPC,
-- adds expires_at to participant_events, and locks down register_participant_events permissions.

-- 1. Table: processed_payment_events (Database-enforced idempotency for payments)
CREATE TABLE IF NOT EXISTS public.processed_payment_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id text NOT NULL,
    payment_id text NOT NULL,
    event_type text NOT NULL,
    processed_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_processed_payment_event UNIQUE (payment_id, event_type)
);

ALTER TABLE public.processed_payment_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.processed_payment_events FROM anon, authenticated;
GRANT ALL ON TABLE public.processed_payment_events TO service_role;

CREATE INDEX IF NOT EXISTS idx_processed_payment_events_order_id ON public.processed_payment_events (order_id);
CREATE INDEX IF NOT EXISTS idx_processed_payment_events_payment_id ON public.processed_payment_events (payment_id);

-- 2. Table: rate_limits (Distributed sliding-window rate limiting)
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key text PRIMARY KEY,
    count integer NOT NULL DEFAULT 1,
    reset_at timestamptz NOT NULL
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.rate_limits FROM anon, authenticated;
GRANT ALL ON TABLE public.rate_limits TO service_role;

-- Rate limit increment RPC
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_key text,
    p_max_requests integer,
    p_window_seconds integer
)
RETURNS TABLE (
    allowed boolean,
    current_count integer,
    retry_after integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_now timestamptz := now();
    v_entry record;
    v_reset_at timestamptz;
BEGIN
    SELECT * INTO v_entry FROM public.rate_limits WHERE key = p_key FOR UPDATE;

    IF v_entry IS NULL OR v_entry.reset_at <= v_now THEN
        v_reset_at := v_now + (p_window_seconds || ' seconds')::interval;
        INSERT INTO public.rate_limits (key, count, reset_at)
        VALUES (p_key, 1, v_reset_at)
        ON CONFLICT (key) DO UPDATE
        SET count = 1, reset_at = v_reset_at;

        RETURN QUERY SELECT true, 1, 0;
    ELSE
        IF v_entry.count >= p_max_requests THEN
            RETURN QUERY SELECT false, v_entry.count, EXTRACT(EPOCH FROM (v_entry.reset_at - v_now))::integer;
        ELSE
            UPDATE public.rate_limits
            SET count = count + 1
            WHERE key = p_key;

            RETURN QUERY SELECT true, v_entry.count + 1, 0;
        END IF;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) TO service_role;

-- 3. Add expires_at to participant_events for seat reservation lifecycle
ALTER TABLE public.participant_events
    ADD COLUMN IF NOT EXISTS expires_at timestamptz DEFAULT (now() + interval '30 minutes');

CREATE INDEX IF NOT EXISTS idx_participant_events_payment_expiry
    ON public.participant_events (payment_status, expires_at)
    WHERE payment_status = 'pending';

-- 4. Enforce strict permissions on register_participant_events RPC
REVOKE ALL ON FUNCTION public.register_participant_events(text, text, text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_participant_events(text, text, text, text, text, jsonb) TO service_role;
