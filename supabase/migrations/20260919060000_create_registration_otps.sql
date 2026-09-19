-- ============================================================
-- SAVISKAR 2026 — PERSISTENT REGISTRATION OTP STORAGE
-- Migration: 20260919060000_create_registration_otps.sql
--
-- Provides serverless-safe persistent storage for passwordless
-- registration OTP verification across independent Vercel instances.
--
-- Security guarantees:
--   - Plaintext OTP is NEVER stored (only salted HMAC-SHA256 hashes)
--   - Row-Level Security (RLS) is enabled
--   - Direct public/anon/authenticated access is explicitly REVOKED
--   - Only service_role (server-side API handlers) has access
--   - Expiration and failed attempt tracking for lockout defense
-- ============================================================

CREATE TABLE IF NOT EXISTS public.registration_otps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    otp_hash text NOT NULL,
    issued_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,
    attempts integer NOT NULL DEFAULT 0,
    consumed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index on email to accelerate active OTP lookups
CREATE INDEX IF NOT EXISTS idx_registration_otps_email
    ON public.registration_otps (email);

-- Index on expires_at for fast query filtering and garbage collection
CREATE INDEX IF NOT EXISTS idx_registration_otps_expires_at
    ON public.registration_otps (expires_at);

-- Composite index for fast lookup of active unconsumed OTPs by email
CREATE INDEX IF NOT EXISTS idx_registration_otps_active
    ON public.registration_otps (email, consumed_at, expires_at);

-- ============================================================
-- RLS & PERMISSION HARDENING
-- ============================================================

-- Enable RLS — blocks non-service_role access since no permissive policies are granted
ALTER TABLE public.registration_otps ENABLE ROW LEVEL SECURITY;

-- Explicitly revoke all client privileges
REVOKE ALL ON TABLE public.registration_otps FROM PUBLIC;
REVOKE ALL ON TABLE public.registration_otps FROM anon;
REVOKE ALL ON TABLE public.registration_otps FROM authenticated;

-- Explicit service_role grants for backend API routes
GRANT ALL ON TABLE public.registration_otps TO service_role;

-- ============================================================
-- ATOMIC CONCURRENCY FUNCTIONS (service_role ONLY)
-- ============================================================

CREATE OR REPLACE FUNCTION public.increment_registration_otp_attempts(p_otp_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_attempts integer;
BEGIN
    UPDATE public.registration_otps
    SET attempts = attempts + 1,
        updated_at = now()
    WHERE id = p_otp_id
    RETURNING attempts INTO v_attempts;

    RETURN COALESCE(v_attempts, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.increment_registration_otp_attempts(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_registration_otp_attempts(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.increment_registration_otp_attempts(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.increment_registration_otp_attempts(uuid) TO service_role;
