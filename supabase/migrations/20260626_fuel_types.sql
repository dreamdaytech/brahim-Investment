-- Run this in Supabase Dashboard -> SQL Editor

-- 1. Add fuel_type column if it doesn't exist
ALTER TABLE public.fuel_collections ADD COLUMN IF NOT EXISTS fuel_type TEXT;

-- 2. Update existing records to have a random fuel type so they don't show up empty
UPDATE public.fuel_collections 
SET fuel_type = (ARRAY['Petrol', 'Diesel', 'Premium'])[floor(random() * 3 + 1)] 
WHERE fuel_type IS NULL;
