import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

const connectionString = 'postgresql://postgres:TdJzK679YjWJbU7P@db.oxxdkxsjnhpbprmjxtgs.supabase.co:5432/postgres';

async function runMigration() {
  const client = new Client({
    connectionString,
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();

    console.log('Reading schema file...');
    const schemaSql = fs.readFileSync(path.join(process.cwd(), 'supabase_schema.sql'), 'utf-8');

    console.log('Executing schema...');
    await client.query(schemaSql);

    console.log('✅ Schema executed successfully! All tables and RLS policies have been created.');
  } catch (err) {
    console.error('❌ Error executing schema:', err);
  } finally {
    await client.end();
  }
}

runMigration();
