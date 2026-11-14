-- Optional, additive upgrade for Brahim Investment Group reservations.
-- Apply to the verified Brahim Supabase project before relying on ID-based
-- inquiry/vehicle association. Existing inquiry fields and rows are unchanged.
--
-- Keep preferredvehicle as the submitted name snapshot so old inquiries
-- remain readable and still make sense if a fleet vehicle is later removed.
ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS requested_vehicle_id UUID
  REFERENCES public.vehicles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS inquiries_requested_vehicle_id_idx
  ON public.inquiries(requested_vehicle_id);

COMMENT ON COLUMN public.inquiries.requested_vehicle_id IS
  'Optional specific fleet vehicle requested by the customer. This is not an assigned vehicle.';
