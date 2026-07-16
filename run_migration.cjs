const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: `postgresql://postgres:${process.env.Database_Password}@db.oxxdkxsjnhpbprmjxtgs.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  await client.connect();
  console.log('Connected to database.');

  const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'clients'");
  console.log('Columns:', res.rows.map(r => r.column_name));
  await client.end();
}

runMigration().catch(e => {
  console.error('Migration failed:', e.message);
  client.end();
  process.exit(1);
});
