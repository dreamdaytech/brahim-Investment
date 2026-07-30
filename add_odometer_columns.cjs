const { Client } = require('pg');

const client = new Client({
  connectionString: `postgresql://postgres:TdJzK679YjWJbU7P@db.oxxdkxsjnhpbprmjxtgs.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  await client.connect();
  console.log('Connected to database.');

  const query = `
    ALTER TABLE public.trip_logs
    ADD COLUMN IF NOT EXISTS odometer_out NUMERIC,
    ADD COLUMN IF NOT EXISTS odometer_in NUMERIC;
  `;

  await client.query(query);
  console.log('Columns added successfully.');
  
  await client.end();
}

runMigration().catch(e => {
  console.error('Migration failed:', e.message);
  client.end();
  process.exit(1);
});
