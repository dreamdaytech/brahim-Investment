const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres:TdJzK679YjWJbU7P@db.oxxdkxsjnhpbprmjxtgs.supabase.co:5432/postgres'
  });
  
  try {
    await client.connect();
    console.log("Connected to database");
    await client.query(`ALTER TABLE trip_logs ADD COLUMN IF NOT EXISTS approval_signature TEXT;`);
    console.log("Added approval_signature column to trip_logs");
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    await client.end();
  }
}

run();
