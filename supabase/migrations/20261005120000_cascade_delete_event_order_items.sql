-- Migration: 20261005120000_cascade_delete_event_order_items.sql
-- Description: Allow clean event deletion when there are no active registrations by updating
-- the foreign key constraint on payment_order_items.event_id to ON DELETE CASCADE.
-- Active participants in participant_events are still protected via ON DELETE RESTRICT and API validation.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payment_order_items_event_id_fkey'
    ) THEN
        ALTER TABLE public.payment_order_items
            DROP CONSTRAINT payment_order_items_event_id_fkey;
    END IF;

    ALTER TABLE public.payment_order_items
        ADD CONSTRAINT payment_order_items_event_id_fkey
        FOREIGN KEY (event_id)
        REFERENCES public.events(id)
        ON DELETE CASCADE;
END $$;
