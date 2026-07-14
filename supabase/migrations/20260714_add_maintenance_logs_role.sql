-- Migration: Add 'maintenance_logs' to the user_roles role CHECK constraint
-- Drop the existing constraint and recreate it with the new role value

ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('super_admin', 'admin', 'fleet_manager', 'finance', 'maintenance_logs'));
