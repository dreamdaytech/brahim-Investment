import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oxxdkxsjnhpbprmjxtgs.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94eGRreHNqbmhwYnBybWp4dGdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjE1MzAwOSwiZXhwIjoyMDk3NzI5MDA5fQ.ZnXs1gi4xn77EruMFohA2tDTdNm4zorO0vzuIvneJdI';

const sql = `
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
  trip_log_id          TEXT
);
CREATE INDEX IF NOT EXISTS idx_completed_dispatches_driver ON completed_dispatches(driver_id);
CREATE INDEX IF NOT EXISTS idx_completed_dispatches_vehicle ON completed_dispatches(vehicle_id);
ALTER TABLE ONLY completed_dispatches ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='completed_dispatches' AND policyname='Allow all completed_dispatches') THEN
    CREATE POLICY "Allow all completed_dispatches" ON completed_dispatches FOR ALL TO public USING (true);
  END IF;
END $$;
`;

const body = JSON.stringify({ query: sql });

const options = {
  hostname: 'oxxdkxsjnhpbprmjxtgs.supabase.co',
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY,
    'Authorization': 'Bearer ' + SERVICE_KEY,
    'Content-Length': Buffer.byteLength(body)
  }
};

// Try Supabase JS client approach
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

async function run() {
  // Check if table already exists by trying to select from it
  const check = await sb.from('completed_dispatches').select('id').limit(0);
  if (!check.error) {
    console.log('Table already exists - skipping creation');
    return;
  }

  // Use management API via fetch
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': 'Bearer ' + SERVICE_KEY,
        'Prefer': 'return=minimal'
      }
    }
  );

  // Fallback: use the Supabase SQL endpoint via management API
  const mgmtResponse = await fetch(
    `https://api.supabase.com/v1/projects/oxxdkxsjnhpbprmjxtgs/database/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SERVICE_KEY
      },
      body: JSON.stringify({ query: sql })
    }
  );
  
  const result = await mgmtResponse.text();
  console.log('Result:', result);
}

run().catch(console.error);
