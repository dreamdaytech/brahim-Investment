-- ============================================================
-- 005_security_hardening.sql
-- Security hardening migration: fixes HIGH-1, MED-1, MED-2
-- ============================================================

-- ── MED-2: Fix recursive RLS on user_roles write policies ──────────────────────
-- Create a SECURITY DEFINER helper function that reads the role WITHOUT
-- triggering RLS, preventing infinite recursion on INSERT/UPDATE/DELETE policies.

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE id = auth.uid();
$$;

-- Drop the old recursive write policies
DROP POLICY IF EXISTS "Super admins can insert" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can update" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can delete" ON public.user_roles;

-- Recreate them using the non-recursive helper function
CREATE POLICY "Super admins can insert"
ON public.user_roles FOR INSERT
WITH CHECK ( public.get_current_user_role() = 'super_admin' );

CREATE POLICY "Super admins can update"
ON public.user_roles FOR UPDATE
USING ( public.get_current_user_role() = 'super_admin' );

CREATE POLICY "Super admins can delete"
ON public.user_roles FOR DELETE
USING ( public.get_current_user_role() = 'super_admin' );


-- ── HIGH-1: Tighten permissive "Allow All" RLS policies ────────────────────────

-- 1. completed_dispatches — was open to ALL (including anonymous)
DROP POLICY IF EXISTS "Allow all completed_dispatches" ON public.completed_dispatches;
DROP POLICY IF EXISTS "Allow anon all completed_dispatches" ON public.completed_dispatches;

CREATE POLICY "Authenticated read completed_dispatches"
  ON public.completed_dispatches FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated write completed_dispatches"
  ON public.completed_dispatches FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated update completed_dispatches"
  ON public.completed_dispatches FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "Authenticated delete completed_dispatches"
  ON public.completed_dispatches FOR DELETE
  TO authenticated USING (true);


-- 2. team_members — was open to ALL (including anonymous writes)
DROP POLICY IF EXISTS "Allow all for team_members" ON public.team_members;
-- Keep the public SELECT policy (needed for public team page)
-- But restrict writes to authenticated users only

CREATE POLICY "Authenticated write team_members"
  ON public.team_members FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated update team_members"
  ON public.team_members FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "Authenticated delete team_members"
  ON public.team_members FOR DELETE
  TO authenticated USING (true);


-- 3. Revoke the overly broad GRANT to anon on fuel tables
-- (Replace with proper RLS policies)
REVOKE ALL ON TABLE public.fuel_cities FROM anon;
REVOKE ALL ON TABLE public.fuel_stations FROM anon;

-- Grant SELECT only to anon (needed for public-facing forms/dropdowns if used)
GRANT SELECT ON TABLE public.fuel_cities TO anon, authenticated;
GRANT SELECT ON TABLE public.fuel_stations TO anon, authenticated;
-- Only authenticated staff can write fuel data
GRANT INSERT, UPDATE, DELETE ON TABLE public.fuel_cities TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.fuel_stations TO authenticated;


-- ── MED-1: Make storage buckets private ────────────────────────────────────────
-- Change driver-assets and vehicle-assets from public to private
UPDATE storage.buckets
  SET public = false
  WHERE id IN ('driver-assets', 'vehicle-assets');

-- Add Storage RLS policies so only authenticated users can read documents
-- (These are Supabase Storage policies — they go in the storage schema)
INSERT INTO storage.policies (bucket_id, name, definition, operation)
VALUES
  ('driver-assets',  'Authenticated read driver assets',   '(role() = ''authenticated'')', 'SELECT'),
  ('driver-assets',  'Authenticated write driver assets',  '(role() = ''authenticated'')', 'INSERT'),
  ('driver-assets',  'Authenticated update driver assets', '(role() = ''authenticated'')', 'UPDATE'),
  ('driver-assets',  'Authenticated delete driver assets', '(role() = ''authenticated'')', 'DELETE'),
  ('vehicle-assets', 'Authenticated read vehicle assets',  '(role() = ''authenticated'')', 'SELECT'),
  ('vehicle-assets', 'Authenticated write vehicle assets', '(role() = ''authenticated'')', 'INSERT'),
  ('vehicle-assets', 'Authenticated update vehicle assets','(role() = ''authenticated'')', 'UPDATE'),
  ('vehicle-assets', 'Authenticated delete vehicle assets','(role() = ''authenticated'')', 'DELETE')
ON CONFLICT DO NOTHING;

-- Force PostgREST to reload the API schema
NOTIFY pgrst, reload_schema;
