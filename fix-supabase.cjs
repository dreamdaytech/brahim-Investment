const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.oxxdkxsjnhpbprmjxtgs:TdJzK679YjWJbU7P@aws-0-eu-west-2.pooler.supabase.com:6543/postgres'
});

async function fixRPC() {
  await client.connect();
  console.log('Connected to pg');

  // Fix the RPC get_driver_scores
  const sql = `
    CREATE OR REPLACE FUNCTION get_driver_scores()
    RETURNS TABLE (
      driver_id uuid,
      total_score bigint,
      trips_completed bigint,
      on_time_returns bigint
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        d.id as driver_id,
        COALESCE(SUM(c.score), 0) as total_score,
        COUNT(c.id) as trips_completed,
        COUNT(CASE WHEN c.returned_on_time THEN 1 END) as on_time_returns
      FROM drivers d
      LEFT JOIN completed_dispatches c ON d.id = c.driver_id
      GROUP BY d.id;
    END;
    $$ LANGUAGE plpgsql;
  `;

  try {
    await client.query(sql);
    console.log('✅ get_driver_scores fixed!');
  } catch (err) {
    console.log('❌ Error fixing RPC:', err.message);
  }

  // Verify tables
  const { rows } = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);
  
  console.log('Tables in public schema:', rows.map(r => r.table_name).join(', '));

  await client.end();
}

fixRPC();
