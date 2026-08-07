-- Create the expense_categories table
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all actions for authenticated users (since admin sections are protected in UI, or allow anon for simplicity matching the current setup)
DROP POLICY IF EXISTS "Allow anon all on expense_categories" ON public.expense_categories;
CREATE POLICY "Allow anon all on expense_categories"
  ON public.expense_categories FOR ALL USING (true);

-- Insert default categories
INSERT INTO public.expense_categories (name)
VALUES 
  ('Driver Stipend'),
  ('Per Diem'),
  ('Fuel Advance'),
  ('Petty Cash'),
  ('Maintenance Payment'),
  ('Spare Parts Payment'),
  ('Other')
ON CONFLICT (name) DO NOTHING;
