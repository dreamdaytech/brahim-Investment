-- Create the projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all actions
DROP POLICY IF EXISTS "Allow anon all on projects" ON public.projects;
CREATE POLICY "Allow anon all on projects"
  ON public.projects FOR ALL USING (true);

-- Add project column to expenses table if it does not exist
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS project TEXT;

-- Insert default projects
INSERT INTO public.projects (name)
VALUES 
  ('Salone Fuel Monitor'),
  ('Road Construction Alpha'),
  ('HQ Maintenance')
ON CONFLICT (name) DO NOTHING;
