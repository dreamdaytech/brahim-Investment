const { Client } = require('pg');

const client = new Client({
  connectionString: `postgresql://postgres:TdJzK679YjWJbU7P@db.oxxdkxsjnhpbprmjxtgs.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  await client.connect();
  console.log('Connected to database.');

  const query = `
    CREATE TABLE IF NOT EXISTS public.suppliers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        contact_person TEXT,
        phone TEXT,
        email TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS public.maintenance_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
        supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
        service_date DATE NOT NULL,
        spares_description TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        cost NUMERIC NOT NULL,
        odometer_reading NUMERIC,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  `;

  await client.query(query);
  console.log('Tables created successfully.');
  
  await client.end();
}

runMigration().catch(e => {
  console.error('Migration failed:', e.message);
  client.end();
  process.exit(1);
});
