-- Update clients table to support extended Project/Fuel Supplier fields

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS short_code TEXT,
  ADD COLUMN IF NOT EXISTS is_partner BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS contact_person TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS head_office_address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS account_number TEXT,
  ADD COLUMN IF NOT EXISTS contract_ref TEXT,
  ADD COLUMN IF NOT EXISTS contract_start_date DATE,
  ADD COLUMN IF NOT EXISTS contract_end_date DATE,
  ADD COLUMN IF NOT EXISTS credit_limit NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_purchases NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_volume NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Migrate existing status to the new standard if needed. 
-- The new standard uses 'Active', 'Inactive', 'Pending'.
-- We'll keep the column as TEXT to support existing data like 'Ongoing', 
-- but map them in the UI or update them here:
UPDATE public.clients SET status = 'Active' WHERE status ILIKE '%Ongoing%';
UPDATE public.clients SET status = 'Inactive' WHERE status ILIKE '%Completed%';
