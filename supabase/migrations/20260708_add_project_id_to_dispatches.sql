-- Add project_id column to active_dispatches and completed_dispatches
-- Stores the client ID used as a "project" reference for the dispatch

ALTER TABLE public.active_dispatches
  ADD COLUMN IF NOT EXISTS project_id TEXT;

ALTER TABLE public.completed_dispatches
  ADD COLUMN IF NOT EXISTS project_id TEXT;
