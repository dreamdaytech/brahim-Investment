-- Run this in Supabase Dashboard → SQL Editor

-- Add documents column to vehicles table
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;
