-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.maintenance_spares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_record_id UUID REFERENCES public.maintenance_records(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_cost NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.maintenance_spares ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access (matching your current setup)
CREATE POLICY "Allow anon all maintenance_spares" ON public.maintenance_spares FOR ALL USING (true);
