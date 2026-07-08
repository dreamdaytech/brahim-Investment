-- Create a table for public user roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'fleet_manager', 'finance')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
USING ( auth.uid() = id );

-- Allow super_admin to do everything
CREATE POLICY "Super admins can view all"
ON public.user_roles FOR SELECT
USING ( EXISTS (SELECT 1 FROM public.user_roles WHERE id = auth.uid() AND role = 'super_admin') );

CREATE POLICY "Super admins can insert"
ON public.user_roles FOR INSERT
WITH CHECK ( EXISTS (SELECT 1 FROM public.user_roles WHERE id = auth.uid() AND role = 'super_admin') );

CREATE POLICY "Super admins can update"
ON public.user_roles FOR UPDATE
USING ( EXISTS (SELECT 1 FROM public.user_roles WHERE id = auth.uid() AND role = 'super_admin') );

CREATE POLICY "Super admins can delete"
ON public.user_roles FOR DELETE
USING ( EXISTS (SELECT 1 FROM public.user_roles WHERE id = auth.uid() AND role = 'super_admin') );

-- Create a function to automatically insert a user_roles row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_roles (id, email, full_name, role, is_active)
  VALUES (new.id, new.email, '', 'fleet_manager', true);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Manually set the first user to super_admin (Run this in the dashboard after running the above)
-- UPDATE public.user_roles SET role = 'super_admin' WHERE email = 'your-admin-email@example.com';
