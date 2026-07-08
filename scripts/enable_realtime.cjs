const { Client } = require('pg');

const client = new Client({
  host: 'db.oxxdkxsjnhpbprmjxtgs.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'TdJzK679YjWJbU7P',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const { rows } = await client.query("SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime'");
  console.log('Realtime tables:', rows.map(r => r.tablename));
  
  if (!rows.find(r => r.tablename === 'team_members')) {
    console.log('Adding team_members to supabase_realtime...');
    await client.query("ALTER PUBLICATION supabase_realtime ADD TABLE team_members;");
    console.log('Added!');
  } else {
    console.log('Already in publication.');
  }

  await client.end();
}
run().catch(console.error);
