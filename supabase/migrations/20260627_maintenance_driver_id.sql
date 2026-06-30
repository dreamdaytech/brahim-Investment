ALTER TABLE public.maintenance_records ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL;

NOTIFY pgrst, 'reload schema';