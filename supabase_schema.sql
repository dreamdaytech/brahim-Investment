-- Drivers
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    img_url TEXT,
    status TEXT NOT NULL,
    license_expiry DATE NOT NULL,
    awards TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Vehicles
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    make_model TEXT NOT NULL,
    year INTEGER NOT NULL,
    plate_number TEXT NOT NULL,
    status TEXT NOT NULL,
    insurance_expiry DATE NOT NULL,
    condition TEXT,
    is_company_registered BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Corporate Accounts
CREATE TABLE IF NOT EXISTS public.corporate_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    billing_type TEXT NOT NULL,
    rate NUMERIC NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Active Dispatches
CREATE TABLE IF NOT EXISTS public.active_dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    corporate_account_id UUID REFERENCES public.corporate_accounts(id) ON DELETE SET NULL,
    dispatch_time TIMESTAMP WITH TIME ZONE NOT NULL,
    odometer_out NUMERIC NOT NULL,
    fuel_level_out TEXT NOT NULL,
    condition_out TEXT,
    expected_return_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trip Logs
CREATE TABLE IF NOT EXISTS public.trip_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    corporate_account_id UUID REFERENCES public.corporate_accounts(id) ON DELETE SET NULL,
    project_code TEXT,
    distance_traveled_km NUMERIC NOT NULL,
    fuel_consumed_liters NUMERIC NOT NULL,
    incidents INTEGER DEFAULT 0,
    speeding_events INTEGER DEFAULT 0,
    harsh_braking INTEGER DEFAULT 0,
    idling_time_hours NUMERIC DEFAULT 0,
    route_deviations INTEGER DEFAULT 0,
    policy_violations INTEGER DEFAULT 0,
    maintenance_issues_logged BOOLEAN DEFAULT false,
    notes TEXT,
    approval_status TEXT DEFAULT 'Pending',
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    approval_notes TEXT,
    legs JSONB,
    passengers JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Fuel Collections
CREATE TABLE IF NOT EXISTS public.fuel_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_log_id UUID REFERENCES public.trip_logs(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
    station_name TEXT NOT NULL,
    location TEXT NOT NULL,
    liters NUMERIC NOT NULL,
    cost_per_liter NUMERIC NOT NULL,
    receipt_number TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    period TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Maintenance Records
CREATE TABLE IF NOT EXISTS public.maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    expected_completion_date DATE,
    issues_found TEXT NOT NULL,
    cost NUMERIC DEFAULT 0,
    status TEXT NOT NULL,
    mechanic_or_shop TEXT,
    mechanic_contact TEXT,
    mechanic_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and permissive policies for anon users
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corporate_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon all drivers" ON public.drivers FOR ALL USING (true);
CREATE POLICY "Allow anon all vehicles" ON public.vehicles FOR ALL USING (true);
CREATE POLICY "Allow anon all corporate_accounts" ON public.corporate_accounts FOR ALL USING (true);
CREATE POLICY "Allow anon all active_dispatches" ON public.active_dispatches FOR ALL USING (true);
CREATE POLICY "Allow anon all trip_logs" ON public.trip_logs FOR ALL USING (true);
CREATE POLICY "Allow anon all fuel_collections" ON public.fuel_collections FOR ALL USING (true);
CREATE POLICY "Allow anon all invoices" ON public.invoices FOR ALL USING (true);
CREATE POLICY "Allow anon all maintenance_records" ON public.maintenance_records FOR ALL USING (true);
