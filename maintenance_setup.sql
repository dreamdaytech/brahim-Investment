-- 1. Create Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon all suppliers" ON public.suppliers FOR ALL USING (true);

-- 2. Modify existing maintenance_records table to support the new features
-- We add these columns if they do not exist.
ALTER TABLE public.maintenance_records ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL;
ALTER TABLE public.maintenance_records ADD COLUMN IF NOT EXISTS spares_description TEXT;
ALTER TABLE public.maintenance_records ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE public.maintenance_records ADD COLUMN IF NOT EXISTS odometer_reading NUMERIC;
ALTER TABLE public.maintenance_records ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.maintenance_records ADD COLUMN IF NOT EXISTS service_date DATE;

-- Note: The existing table already has 'cost' and 'status' columns.

-- 3. Create Spares Inventory Table (Optional, for tracking stock)
CREATE TABLE IF NOT EXISTS public.spare_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    part_number TEXT,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    quantity_in_stock INTEGER DEFAULT 0,
    unit_cost NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for spare_parts
ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon all spare_parts" ON public.spare_parts FOR ALL USING (true);
