import { Client } from 'pg';

const connectionString = 'postgresql://postgres:TdJzK679YjWJbU7P@db.oxxdkxsjnhpbprmjxtgs.supabase.co:5432/postgres';

const sql = `
-- ── Driver Status Logs ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS driver_status_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id     UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  status        TEXT NOT NULL,
  reason        TEXT NOT NULL DEFAULT '',
  recorded_by   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast per-driver lookups
CREATE INDEX IF NOT EXISTS idx_driver_status_logs_driver_id
  ON driver_status_logs(driver_id);

-- Index for chronological ordering
CREATE INDEX IF NOT EXISTS idx_driver_status_logs_created_at
  ON driver_status_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE driver_status_logs ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (adjust to match your drivers table policy)
CREATE POLICY IF NOT EXISTS "Allow all driver_status_logs" ON driver_status_logs
  FOR ALL USING (true) WITH CHECK (true);
`;

async function run() {
  const client = new Client({ connectionString });
  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Running migration: driver_status_logs...');
    await client.query(sql);
    console.log('✅ driver_status_logs table created successfully!');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
  } finally {
    await client.end();
  }
}

run();
