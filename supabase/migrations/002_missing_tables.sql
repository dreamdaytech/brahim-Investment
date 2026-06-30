-- Run this in Supabase Dashboard → SQL Editor

-- 1. Create completed_dispatches table
CREATE TABLE IF NOT EXISTS public.completed_dispatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_dispatch_id UUID,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  corporate_account_id UUID REFERENCES public.corporate_accounts(id) ON DELETE SET NULL,
  dispatch_time TIMESTAMP WITH TIME ZONE NOT NULL,
  odometer_out NUMERIC DEFAULT 0,
  fuel_level_out TEXT,
  condition_out TEXT,
  expected_return_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trip_log_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add trip_count to invoices
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS trip_count INTEGER;

-- 3. Add odometer to vehicles if missing
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS odometer NUMERIC DEFAULT 0;

-- 4. RLS
ALTER TABLE public.completed_dispatches ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow anon all completed_dispatches"
  ON public.completed_dispatches FOR ALL USING (true);
