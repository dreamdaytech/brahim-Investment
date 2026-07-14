const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: `postgresql://postgres:${process.env.Database_Password}@db.oxxdkxsjnhpbprmjxtgs.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  await client.connect();
  console.log('Connected to database.');

  await client.query('ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check');
  console.log('Old constraint dropped.');

  await client.query(`
    ALTER TABLE public.user_roles
    ADD CONSTRAINT user_roles_role_check
    CHECK (role IN ('super_admin', 'admin', 'fleet_manager', 'finance', 'maintenance_logs'))
  `);
  console.log('New constraint added with maintenance_logs role.');

  await client.end();
}

runMigration().catch(e => {
  console.error('Migration failed:', e.message);
  client.end();
  process.exit(1);
});
