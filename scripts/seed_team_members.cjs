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
  console.log('Connected!');

  await client.query(`
    CREATE TABLE IF NOT EXISTS public.team_members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      bio TEXT,
      dedicated_role TEXT,
      languages TEXT,
      phone TEXT,
      email TEXT,
      skills TEXT[] DEFAULT '{}',
      image_url TEXT,
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  console.log('Table created (or already exists)');

  await client.query(`ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;`);

  await client.query(`
    DO $$ BEGIN
      CREATE POLICY "Allow all team_members" ON public.team_members FOR ALL USING (TRUE);
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `);

  const { rows } = await client.query('SELECT COUNT(*) FROM public.team_members');
  console.log('Existing rows:', rows[0].count);

  if (parseInt(rows[0].count) === 0) {
    await client.query(`
      INSERT INTO public.team_members (name, role, bio, dedicated_role, languages, phone, email, skills, image_url, display_order) VALUES
      ('Emmanuel A.H Kpakama', 'Head of Admin and Logistics', 'Results-driven Fleet Management Administrator with over 10 years of comprehensive experience directing large-scale fleet operations, fuel management, procurement, and administrative functions.', 'Primary point of contact for Helen Keller Intl', 'English and local languages', '+23234692208 / +23275868682', 'Bigroupsl2010@gmail.com', ARRAY['Defensive-Driving Assessor', 'Missions Liaison Lead', '10+ Yrs Experience'], '/images/emmanuel.jpg', 1),
      ('Mamadu Sara Bah', 'Head of Finance, Accounting and Compliance', 'Oversees financial operations, compliance reporting for international partnerships, and strict auditing protocols across all logistics deployments.', NULL, NULL, NULL, NULL, ARRAY['Corporate Auditing', 'International Compliance', 'Financial Operations'], NULL, 2),
      ('Fatima Jaward Jalloh', 'Finance and Fuel Controller', 'Manages fuel distribution networks, expense tracking, and cost optimizations.', NULL, NULL, NULL, NULL, ARRAY['Resource Optimization', 'Fuel Audit Protocols', 'Cost Tracking'], NULL, 3),
      ('Philip Hebron', 'Fleet and Facility Coordinator', 'Oversees daily fleet movements, dispatch schedules, and the maintenance of operational facilities.', NULL, NULL, NULL, NULL, ARRAY['Dispatch Logistics', 'Facility Administration', 'Asset Allocation'], NULL, 4),
      ('Hawa Bangura', 'Procurement, Finance and Logistics Assistant', 'Supports cross-functional coordination, acquiring vital deployment materials safely.', NULL, NULL, NULL, NULL, ARRAY['Procurement Pipeline', 'Invoice Processing', 'Supply Chain Liaison'], NULL, 5),
      ('Bailor Barrie', 'Maintenance Supervisor', 'Specialized in mechanical safety protocols and deep diagnostic vetting.', NULL, NULL, NULL, NULL, ARRAY['Advanced Diagnostics', 'Preventative Care', 'Rapid Recovery'], NULL, 6),
      ('Abdul Mustapha', 'Maintenance Supervisor', 'Conducts strict point-by-point inspections after every deployment.', NULL, NULL, NULL, NULL, ARRAY['Heavy Machinery Recovery', 'Engine Systems', 'Field Support'], NULL, 7),
      ('Osman Kamara (OTK)', 'Monitoring and Evaluation Supervisor', 'Responsible for long-term fleet tracking, driver KPI auditing, and ensuring rigorous mechanical compliance standards.', NULL, NULL, NULL, NULL, ARRAY['Performance Auditing', 'GPS Analytics', 'Compliance Metrics'], NULL, 8);
    `);
    console.log('Seeded 8 team members!');
  } else {
    console.log('Table already has data, skipping seed');
  }

  await client.end();
  console.log('Done.');
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
