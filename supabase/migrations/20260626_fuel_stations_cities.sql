-- Migration: Add Fuel Stations and Cities tables

-- 1. Create fuel_cities table
CREATE TABLE IF NOT EXISTS public.fuel_cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    region TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create fuel_stations table
CREATE TABLE IF NOT EXISTS public.fuel_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city_id UUID REFERENCES public.fuel_cities(id) ON DELETE SET NULL,
    is_partner BOOLEAN DEFAULT false,
    supplier TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add RLS Policies
ALTER TABLE public.fuel_cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow anon all fuel_cities" 
    ON public.fuel_cities FOR ALL USING (true);

ALTER TABLE public.fuel_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow anon all fuel_stations" 
    ON public.fuel_stations FOR ALL USING (true);

-- 4. Insert some initial data to get started
INSERT INTO public.fuel_cities (name, region) VALUES 
('Freetown', 'Western Area'),
('Bo', 'Southern Province'),
('Kenema', 'Eastern Province'),
('Makeni', 'Northern Province')
ON CONFLICT DO NOTHING;

-- Optionally pre-seed stations based on existing standard data
-- (We'll leave this to the user to manage via the new UI, but add a couple of examples)
INSERT INTO public.fuel_stations (name, is_partner, supplier) VALUES 
('NP Freetown Main', true, 'NP'),
('TotalEnergies Lumley', false, 'TotalEnergies')
ON CONFLICT DO NOTHING;
