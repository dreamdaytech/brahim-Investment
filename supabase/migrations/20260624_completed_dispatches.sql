-- ── Completed Dispatches (archive of returned/completed trips) ────────────────
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/oxxdkxsjnhpbprmjxtgs/sql
CREATE TABLE IF NOT EXISTS completed_dispatches (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_dispatch_id UUID NOT NULL,
  driver_id            UUID NOT NULL,
  vehicle_id           UUID NOT NULL,
  dispatch_time        TIMESTAMPTZ NOT NULL,
  odometer_out         INTEGER NOT NULL DEFAULT 0,
  fuel_level_out       TEXT,
  condition_out        TEXT,
  corporate_account_id TEXT,
  expected_return_date DATE,
  completed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  trip_log_id          TEXT   -- references the trip log that closed this dispatch
);

CREATE INDEX IF NOT EXISTS idx_completed_dispatches_driver
  ON completed_dispatches(driver_id);

CREATE INDEX IF NOT EXISTS idx_completed_dispatches_vehicle
  ON completed_dispatches(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_completed_dispatches_completed
  ON completed_dispatches(completed_at DESC);

ALTER TABLE ONLY completed_dispatches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'completed_dispatches'
      AND policyname = 'Allow all completed_dispatches'
  ) THEN
    CREATE POLICY "Allow all completed_dispatches"
      ON completed_dispatches FOR ALL TO public USING (true);
  END IF;
END $$;
