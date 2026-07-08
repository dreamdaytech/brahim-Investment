-- Create team_members table
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

-- Enable Row Level Security (open for now)
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow read access on team_members" 
  ON public.team_members FOR SELECT USING (TRUE);

CREATE POLICY IF NOT EXISTS "Allow all for team_members" 
  ON public.team_members FOR ALL USING (TRUE);

-- Seed with existing hardcoded team members
INSERT INTO public.team_members (name, role, bio, dedicated_role, languages, phone, email, skills, image_url, display_order)
SELECT * FROM (VALUES
  ('Emmanuel A.H Kpakama', 'Head of Admin and Logistics',
   'Results-driven Fleet Management Administrator with over 10 years of comprehensive experience directing large-scale fleet operations, fuel management, procurement, and administrative functions across the logistics and construction sectors. Adept at building and implementing fleet management systems, controlling operational costs, ensuring vehicle compliance, and leading cross-functional teams.',
   'Primary point of contact for Helen Keller Intl – receives orders, manages scheduling, resolves issues',
   'English and local languages', '+23234692208 / +23275868682', 'Bigroupsl2010@gmail.com',
   ARRAY['Defensive-Driving Assessor', 'Missions Liaison Lead', '10+ Yrs Experience'],
   '/images/emmanuel.jpg', 1),
  ('Mamadu Sara Bah', 'Head of Finance, Accounting and Compliance',
   'Oversees financial operations, compliance reporting for international partnerships, and strict auditing protocols across all logistics deployments.',
   NULL, NULL, NULL, NULL,
   ARRAY['Corporate Auditing', 'International Compliance', 'Financial Operations'],
   NULL, 2),
  ('Fatima Jaward Jalloh', 'Finance and Fuel Controller',
   'Manages fuel distribution networks, expense tracking, and cost optimizations for deep-upcountry deployments and fleet operations.',
   NULL, NULL, NULL, NULL,
   ARRAY['Resource Optimization', 'Fuel Audit Protocols', 'Cost Tracking'],
   NULL, 3),
  ('Philip Hebron', 'Fleet and Facility Coordinator',
   'Oversees daily fleet movements, dispatch schedules, and the maintenance of operational facilities for real-time responsiveness.',
   NULL, NULL, NULL, NULL,
   ARRAY['Dispatch Logistics', 'Facility Administration', 'Asset Allocation'],
   NULL, 4),
  ('Hawa Bangura', 'Procurement, Finance and Logistics Assistant',
   'Supports cross-functional coordination, acquiring vital deployment materials safely, and ensuring smooth billing pipelines.',
   NULL, NULL, NULL, NULL,
   ARRAY['Procurement Pipeline', 'Invoice Processing', 'Supply Chain Liaison'],
   NULL, 5),
  ('Bailor Barrie', 'Maintenance Supervisor',
   'Specialized in mechanical safety protocols and deep diagnostic vetting before heavy-duty upcountry deployments.',
   NULL, NULL, NULL, NULL,
   ARRAY['Advanced Diagnostics', 'Preventative Care', 'Rapid Recovery'],
   NULL, 6),
  ('Abdul Mustapha', 'Maintenance Supervisor',
   'Conducts strict point-by-point inspections after every deployment to ensure 0% tolerance for failure on our SUV fleets.',
   NULL, NULL, NULL, NULL,
   ARRAY['Heavy Machinery Recovery', 'Engine Systems', 'Field Support'],
   NULL, 7),
  ('Osman Kamara (OTK)', 'Monitoring and Evaluation Supervisor',
   'Responsible for long-term fleet tracking, driver KPI auditing, and ensuring rigorous mechanical compliance standards are met.',
   NULL, NULL, NULL, NULL,
   ARRAY['Performance Auditing', 'GPS Analytics', 'Compliance Metrics'],
   NULL, 8)
) AS v(name, role, bio, dedicated_role, languages, phone, email, skills, image_url, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.team_members LIMIT 1);
