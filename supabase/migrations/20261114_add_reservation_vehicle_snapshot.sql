-- Optional additive schema upgrade for Brahim Investment Group bookings.
-- Apply ONLY to the verified Brahim Supabase project after backing up the
-- database. Public inquiry forms remain compatible until migration is applied.
--
-- Capture only CUSTOMER-VISIBLE vehicle catalogue fields at submission time.
-- The snapshot is the requested model, not an assigned physical fleet unit.
ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS requested_vehicle_snapshot JSONB;

COMMENT ON COLUMN public.inquiries.requested_vehicle_snapshot IS
  'Public details and image URLs of the requested vehicle, captured at inquiry submission; not a confirmed fleet assignment.';

-- No changes to existing reservation rows, RLS, roles or dispatch tables.
