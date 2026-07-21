const { Client } = require('pg');

const client = new Client({
  connectionString: `postgresql://postgres:TdJzK679YjWJbU7P@db.oxxdkxsjnhpbprmjxtgs.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to database.');

    const query = `
      CREATE TABLE IF NOT EXISTS public.dismissed_alerts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          alert_id TEXT NOT NULL UNIQUE,
          dismissed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          dismissed_by TEXT
      );

      -- Optional: Create an index on alert_id for faster lookups
      CREATE INDEX IF NOT EXISTS idx_dismissed_alerts_alert_id ON public.dismissed_alerts(alert_id);
    `;

    console.log('Executing query...');
    await client.query(query);
    console.log('Table dismissed_alerts created successfully.');

  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await client.end();
    console.log('Disconnected from database.');
  }
}

runMigration();
