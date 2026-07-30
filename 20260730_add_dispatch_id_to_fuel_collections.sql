-- Migration: Add dispatch_id to fuel_collections
-- Allows a fuel fill-up to be linked directly to an active dispatch
-- (before a trip log exists for that dispatch)
-- Date: 2026-07-30

ALTER TABLE public.fuel_collections
  ADD COLUMN IF NOT EXISTS dispatch_id UUID REFERENCES public.active_dispatches(id) ON DELETE SET NULL;

-- Optional index for faster dispatch-based lookups
CREATE INDEX IF NOT EXISTS idx_fuel_collections_dispatch_id
  ON public.fuel_collections(dispatch_id);

-- Comment for clarity
COMMENT ON COLUMN public.fuel_collections.dispatch_id IS
  'Links a fuel entry to an active dispatch. Populated when fuel is recorded while a dispatch is still open (no trip log yet).';
