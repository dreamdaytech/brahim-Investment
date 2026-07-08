-- 1. Drop the recursive SELECT policies
DROP POLICY IF EXISTS "Super admins can view all" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;

-- 2. Create a flat SELECT policy that allows all logged-in staff to read the roles table (preventing the infinite recursion error)
CREATE POLICY "Authenticated users can view roles" ON public.user_roles FOR SELECT USING ( auth.role() = 'authenticated' );
