import pg from 'pg';

const { Client } = pg;

// Transaction-safe DDL using pg driver + direct Supabase connection
// Supabase blocks db.xxx.supabase.co — use the session pooler instead
const connectionString = 'postgresql://postgres:TdJzK679YjWJbU7P@aws-0-eu-central-1.pooler.supabase.com:5432/postgres';

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('Connected.');

    await client.query(`
      -- 1. Completed Dispatches (for Dispatch Archive section)
      CREATE TABLE IF NOT EXISTS public.completed_dispatches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        original_dispatch_id UUID,
        driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
        vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
        corporate_account_id UUID REFERENCES public.corporate_accounts(id) ON DELETE SET NULL,
        dispatch_time TIMESTAMP WITH TIME ZONE NOT NULL,
        odometer_out NUMERIC DEFAULT 0,
        fuel_level_out TEXT,
        condition_out TEXT,
        expected_return_date DATE,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        trip_log_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 2. trip_count on invoices
      ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS trip_count INTEGER;

      -- 3. RLS policies
      ALTER TABLE public.completed_dispatches ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow anon all completed_dispatches" ON public.completed_dispatches;
      CREATE POLICY "Allow anon all completed_dispatches" ON public.completed_dispatches FOR ALL USING (true);
    `);

    console.log('✅ Schema updated successfully.');
  } catch (err) {
    console.error('❌', err);
  } finally {
    await client.end();
  }
}

run();
