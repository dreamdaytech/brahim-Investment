import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SERVICE_ROLE_SECRET!;
if (!supabaseUrl || !supabaseServiceKey) { console.error('Missing env vars'); process.exit(1); }
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ─── HELPERS ────────────────────────────────────────────────────────────────
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0]; };
const isoAgo = (hours: number) => new Date(Date.now() - hours * 3600000).toISOString();
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const uuid = () => crypto.randomUUID();

// ─── REFERENCE DATA ──────────────────────────────────────────────────────────
const DRIVERS = [
  { name: 'Abdul Rahman',   img_url: 'https://i.pravatar.cc/150?u=abdul',   status: 'Active',   license_expiry: '2028-01-15', awards: ['Driver of the Month - May 2026'], phone: '+232 77 451 032', email: 'abdulrahman@biggroup.sl', address: '14 Wilkinson Road, Freetown', date_of_birth: '1988-03-12', nationality: 'Sierra Leonean', national_id: 'SL-4512301', license_number: 'DL-7823401', license_type: 'Commercial (CDL)', next_of_kin_name: 'Fatima Rahman', next_of_kin_phone: '+232 78 201 034', next_of_kin_relationship: 'Spouse', emergency_contact_name: 'Ibrahim Rahman', emergency_contact_phone: '+232 76 109 234' },
  { name: 'Alhaji Bah',     img_url: 'https://i.pravatar.cc/150?u=alhaji',   status: 'Warning',  license_expiry: '2026-07-10', awards: [], phone: '+232 76 302 918', email: 'alhjibah@biggroup.sl', address: '7 Circular Road, Freetown', date_of_birth: '1991-07-22', nationality: 'Sierra Leonean', national_id: 'SL-6723011', license_number: 'DL-4490123', license_type: 'Standard (Class B)', next_of_kin_name: 'Kadiatu Bah', next_of_kin_phone: '+232 77 384 561', next_of_kin_relationship: 'Spouse', emergency_contact_name: 'Osman Bah', emergency_contact_phone: '+232 30 192 837' },
  { name: 'Ibrahim Sesay',  img_url: 'https://i.pravatar.cc/150?u=ibrahim',  status: 'Active',   license_expiry: '2027-11-20', awards: ['Safe Driver Award Q1 2026'], phone: '+232 78 887 341', email: 'ibrahimsesay@biggroup.sl', address: '22 Kissy Road, Freetown', date_of_birth: '1985-11-04', nationality: 'Sierra Leonean', national_id: 'SL-3398120', license_number: 'DL-8812934', license_type: 'Commercial (CDL)', next_of_kin_name: 'Mariama Sesay', next_of_kin_phone: '+232 79 110 234', next_of_kin_relationship: 'Sibling', emergency_contact_name: 'Abubakar Sesay', emergency_contact_phone: '+232 76 334 120' },
  { name: 'Mohamed Kamara', img_url: 'https://i.pravatar.cc/150?u=mohamed',  status: 'Warning',  license_expiry: '2026-06-28', awards: [], phone: '+232 30 441 298', email: 'mohamedkamara@biggroup.sl', address: '5 Lumley Beach Road, Freetown', date_of_birth: '1993-01-30', nationality: 'Sierra Leonean', national_id: 'SL-7812903', license_number: 'DL-2213409', license_type: 'Standard (Class B)', next_of_kin_name: 'Isatu Kamara', next_of_kin_phone: '+232 78 512 039', next_of_kin_relationship: 'Parent', emergency_contact_name: 'Samuel Kamara', emergency_contact_phone: '+232 77 881 234' },
  { name: 'Samuel Koroma',  img_url: 'https://i.pravatar.cc/150?u=samuel',   status: 'Active',   license_expiry: '2027-04-05', awards: ['No Incidents - 6 Months 2025'], phone: '+232 79 221 007', email: 'samuelkoroma@biggroup.sl', address: '38 Siaka Stevens Street, Freetown', date_of_birth: '1987-06-18', nationality: 'Sierra Leonean', national_id: 'SL-5512038', license_number: 'DL-6630982', license_type: 'Commercial (CDL)', next_of_kin_name: 'John Koroma', next_of_kin_phone: '+232 76 441 839', next_of_kin_relationship: 'Sibling', emergency_contact_name: 'Sarah Koroma', emergency_contact_phone: '+232 78 229 104' },
  { name: 'Fatmata Sesay',  img_url: 'https://i.pravatar.cc/150?u=fatmata',  status: 'Active',   license_expiry: '2028-11-20', awards: ['Safety Award 2025'], phone: '+232 77 332 561', email: 'fatmatasesay@biggroup.sl', address: '9 Main Street, Waterloo', date_of_birth: '1994-09-14', nationality: 'Sierra Leonean', national_id: 'SL-9920134', license_number: 'DL-1109234', license_type: 'Standard (Class B)', next_of_kin_name: 'Sia Sesay', next_of_kin_phone: '+232 78 110 903', next_of_kin_relationship: 'Parent', emergency_contact_name: 'Mustapha Sesay', emergency_contact_phone: '+232 79 381 027' },
  { name: 'Osman Bangura',  img_url: 'https://i.pravatar.cc/150?u=osman',    status: 'Active',   license_expiry: '2027-09-12', awards: [], phone: '+232 76 118 290', email: 'osmanbangura@biggroup.sl', address: '63 Hill Station Road, Freetown', date_of_birth: '1990-04-22', nationality: 'Sierra Leonean', national_id: 'SL-2291038', license_number: 'DL-3398201', license_type: 'Heavy Goods (HGV)', next_of_kin_name: 'Aminata Bangura', next_of_kin_phone: '+232 30 229 018', next_of_kin_relationship: 'Spouse', emergency_contact_name: 'Alusine Bangura', emergency_contact_phone: '+232 77 102 994' },
  { name: 'John Kargbo',    img_url: 'https://i.pravatar.cc/150?u=john',     status: 'Suspended', license_expiry: '2025-01-10', awards: [], phone: '+232 78 004 329', email: 'johnkargbo@biggroup.sl', address: '2 Bo Highway, Bo', date_of_birth: '1982-12-05', nationality: 'Sierra Leonean', national_id: 'SL-1109234', license_number: 'DL-7782039', license_type: 'Standard (Class B)', next_of_kin_name: 'Mariama Kargbo', next_of_kin_phone: '+232 76 331 920', next_of_kin_relationship: 'Spouse', emergency_contact_name: 'Emmanuel Kargbo', emergency_contact_phone: '+232 79 002 934' },
  { name: 'David Tucker',   img_url: 'https://i.pravatar.cc/150?u=david',    status: 'Active',   license_expiry: '2028-12-01', awards: [], phone: '+232 77 555 111', email: 'davidtucker@biggroup.sl', address: '18 Aberdeen Road, Freetown', date_of_birth: '1989-10-15', nationality: 'Sierra Leonean', national_id: 'SL-8839210', license_number: 'DL-5520912', license_type: 'Standard (Class B)', next_of_kin_name: 'Mary Tucker', next_of_kin_phone: '+232 78 123 987', next_of_kin_relationship: 'Spouse', emergency_contact_name: 'John Tucker', emergency_contact_phone: '+232 76 999 888' },
  { name: 'Michael Cole',   img_url: 'https://i.pravatar.cc/150?u=michael',  status: 'Active',   license_expiry: '2027-02-28', awards: [], phone: '+232 30 777 222', email: 'michaelcole@biggroup.sl', address: '42 Congo Cross, Freetown', date_of_birth: '1995-05-08', nationality: 'Sierra Leonean', national_id: 'SL-4412098', license_number: 'DL-9938120', license_type: 'Standard (Class B)', next_of_kin_name: 'Sarah Cole', next_of_kin_phone: '+232 79 444 333', next_of_kin_relationship: 'Sibling', emergency_contact_name: 'Peter Cole', emergency_contact_phone: '+232 77 666 555' },
];

const VEHICLES = [
  { make_model: 'Toyota Land Cruiser Prado', year: 2015, plate_number: 'AVU 206', status: 'Available',    insurance_expiry: '2027-04-03', condition: 'Excellent', is_company_registered: true, odometer: 154017 },
  { make_model: 'Toyota Land Cruiser',       year: 2019, plate_number: 'ISB 100', status: 'Available',    insurance_expiry: '2027-05-03', condition: 'Excellent', is_company_registered: true, odometer: 139151 },
  { make_model: 'Toyota 4Runner (Big Boy)',  year: 2018, plate_number: 'MYB 001', status: 'Available',    insurance_expiry: '2026-11-03', condition: 'Excellent', is_company_registered: true, odometer: 107639 },
  { make_model: 'Toyota Land Cruiser Prado', year: 2017, plate_number: 'AVO 730', status: 'Available',    insurance_expiry: '2027-05-03', condition: 'Excellent', is_company_registered: true, odometer: 173488 },
  { make_model: 'Toyota Land Cruiser Prado', year: 2017, plate_number: 'AWT 070', status: 'Available',    insurance_expiry: '2026-08-02', condition: 'Excellent', is_company_registered: true, odometer: 143011 },
  { make_model: 'Toyota Land Cruiser Prado', year: 2016, plate_number: 'AWO 668', status: 'Available',    insurance_expiry: '2027-06-03', condition: 'Excellent', is_company_registered: true, odometer: 146416 },
  { make_model: 'Toyota 4Runner Sports Edition', year: 2015, plate_number: 'AUD 118', status: 'Available', insurance_expiry: '2026-08-02', condition: 'Good',      is_company_registered: true, odometer: 100125 },
  { make_model: 'Toyota 4Runner / RAV4',     year: 2014, plate_number: 'AXG 234', status: 'Maintenance', insurance_expiry: '2026-11-02', condition: 'Fair',      is_company_registered: true, odometer: 125689 },
  { make_model: 'Toyota 4Runner Sports Edition', year: 2015, plate_number: 'AUL 390', status: 'Available', insurance_expiry: '2026-10-02', condition: 'Excellent', is_company_registered: true, odometer: 179665 },
  { make_model: 'Toyota 4Runner Sports Edition', year: 2014, plate_number: 'AWI 242', status: 'Available', insurance_expiry: '2027-04-02', condition: 'Good',      is_company_registered: true, odometer: 163481 },
  { make_model: 'Ford Everest',              year: 2021, plate_number: 'BFG 881', status: 'Available',    insurance_expiry: '2027-01-15', condition: 'Excellent', is_company_registered: true, odometer: 45000 },
  { make_model: 'Mitsubishi Pajero',         year: 2018, plate_number: 'AQR 512', status: 'Available',    insurance_expiry: '2026-09-30', condition: 'Good',      is_company_registered: true, odometer: 112040 },
];

const ACCOUNTS = [
  { name: 'UNICEF Sierra Leone',         contact_person: 'Sarah Johnson',     email: 'sjohnson@unicef.org',         phone: '+232 77 123 456', billing_type: 'Monthly Retainer', rate: 4500, status: 'Active' },
  { name: 'WHO Freetown Office',         contact_person: 'Dr. Kwame Osei',    email: 'kwame.osei@who.int',          phone: '+232 76 987 654', billing_type: 'Per Day',          rate: 150,  status: 'Active' },
  { name: 'GIZ Sierra Leone',            contact_person: 'Hans Müller',        email: 'hans.muller@giz.de',         phone: '+232 78 555 666', billing_type: 'Per Day',          rate: 130,  status: 'Active' },
  { name: 'Save the Children',           contact_person: 'Aminata Jalloh',    email: 'ajalloh@savethechildren.org', phone: '+232 30 112 233', billing_type: 'Per Day',          rate: 120,  status: 'Active' },
  { name: 'MSF (Doctors Without Borders)', contact_person: 'Pierre Dubois',   email: 'pdubois@msf.org',            phone: '+232 79 445 566', billing_type: 'Monthly Retainer', rate: 4200, status: 'Active' },
  { name: 'Standard Chartered SL',      contact_person: 'David Cole',         email: 'dcole@standardchartered.com', phone: '+232 76 334 120', billing_type: 'Monthly Retainer', rate: 3800, status: 'Active' },
];

const FUEL_STATIONS = [
  { name: 'TotalEnergies Wilkinson',  location: 'Wilkinson Road, Freetown', cpl: 29.5 },
  { name: 'NP Station East End',      location: 'East Street, Freetown',    cpl: 30.0 },
  { name: 'Leonco Bo Highway',        location: 'Bo Highway, Waterloo',      cpl: 30.5 },
  { name: 'TotalEnergies Lumley',     location: 'Lumley Beach Road, Freetown', cpl: 29.5 },
  { name: 'NP Station Bo Town',       location: 'Bo Town Centre, Bo',       cpl: 31.0 },
  { name: 'Star Oil Kenema',          location: 'Kenema Town, Kenema',      cpl: 31.5 },
];

const MECHANICS = [
  { shop: 'Freetown Auto Works',    contact: '+232 77 223 004', address: '45 Circular Road, Freetown' },
  { shop: 'BIG Group In-House Bay', contact: '+232 76 112 988', address: '11 Freetown Road, Wilberforce' },
  { shop: 'Toyota Authorized SL',   contact: '+232 78 334 091', address: '22 Wilkinson Road, Freetown' },
  { shop: 'Koroma Auto Services',   contact: '+232 79 001 231', address: '7 Bo Highway, Waterloo' },
];

const ROUTES = [
  { from: 'Freetown (HQ)', to: 'Lungi Airport',         km: 8,   purpose: 'VIP airport pickup' },
  { from: 'Freetown (HQ)', to: 'Bo Town',               km: 240, purpose: 'Site visit – Southern Province' },
  { from: 'Freetown (HQ)', to: 'Makeni',                km: 200, purpose: 'Field mission – Northern Province' },
  { from: 'Freetown (HQ)', to: 'Kenema',                km: 290, purpose: 'Programme monitoring' },
  { from: 'Freetown (HQ)', to: 'Waterloo',              km: 45,  purpose: 'Logistics run' },
  { from: 'Bo Town',       to: 'Kenema',                km: 85,  purpose: 'Inter-district transfer' },
  { from: 'Freetown (HQ)', to: 'Port Loko',             km: 80,  purpose: 'District health inspection' },
  { from: 'Freetown (HQ)', to: 'Lunsar',                km: 120, purpose: 'Community outreach' },
];

const PROJECT_CODES = ['UNICEF-FS-2026', 'WHO-MALARIA-26', 'GIZ-AGRI-SL', 'STC-EDU-SL', 'MSF-MED-2026', 'SCB-CORP-26', null, null, null];
const PASSENGERS_POOL = ['Dr. Kwame Osei', 'Sarah Johnson', 'Hans Müller', 'Aminata Jalloh', 'Pierre Dubois', 'David Cole', 'Mariama Bah', 'Abubakar Conteh', 'Sia Kamara'];

// ─── MAIN SEED ───────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱  Brahim Investment Group — Full Platform Seed\n');

  // 1. CLEAR (order respects FK constraints)
  console.log('🧹  Clearing existing data...');
  for (const table of ['fuel_collections','trip_logs','completed_dispatches','active_dispatches','maintenance_records','invoices','driver_status_logs','corporate_accounts','vehicles','drivers']) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error && error.code !== 'PGRST116') console.warn(`  ⚠  ${table}:`, error.message);
  }

  // 2. DRIVERS
  console.log('👤  Seeding Drivers...');
  const { data: drivers, error: dE } = await supabase.from('drivers').insert(DRIVERS).select();
  if (dE) { console.error('❌ drivers:', dE); process.exit(1); }
  console.log(`   ✅  ${drivers!.length} drivers`);

  const D = drivers!; // indexed references below

  // 3. DRIVER STATUS LOGS (for suspended driver + warnings)
  console.log('📋  Seeding Driver Status Logs...');
  const statusLogs = [
    { id: uuid(), driver_id: D[7].id, status: 'Suspended', reason: 'Three consecutive policy violations within 30 days. Suspension pending review.', recorded_by: 'Admin', created_at: new Date(Date.now() - 15 * 86400000).toISOString() },
    { id: uuid(), driver_id: D[1].id, status: 'Warning', reason: 'Speeding events recorded on 4 out of 5 trips last week. Driver counselling issued.', recorded_by: 'Admin', created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
    { id: uuid(), driver_id: D[3].id, status: 'Warning', reason: 'License expiry approaching (28 Jun 2026). Driver notified to renew immediately.', recorded_by: 'Admin', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  ];
  const { error: slE } = await supabase.from('driver_status_logs').insert(statusLogs);
  if (slE) console.warn('  ⚠  status_logs:', slE.message);
  console.log(`   ✅  ${statusLogs.length} status logs`);

  // 4. VEHICLES
  console.log('🚙  Seeding Vehicles...');
  const { data: vehicles, error: vE } = await supabase.from('vehicles').insert(VEHICLES).select();
  if (vE) { console.error('❌ vehicles:', vE); process.exit(1); }
  console.log(`   ✅  ${vehicles!.length} vehicles`);
  const V = vehicles!;

  // 5. CORPORATE ACCOUNTS
  console.log('🏢  Seeding Corporate Accounts...');
  const { data: accounts, error: aE } = await supabase.from('corporate_accounts').insert(ACCOUNTS).select();
  if (aE) { console.error('❌ accounts:', aE); process.exit(1); }
  console.log(`   ✅  ${accounts!.length} corporate accounts`);
  const A = accounts!;

  // 6. MAINTENANCE RECORDS
  console.log('🔧  Seeding Maintenance Records...');
  const maintenance = [
    { id: uuid(), vehicle_id: V[7].id, start_date: daysAgo(14), expected_completion_date: daysAgo(7), issues_found: 'Brake pads worn, left front tyre punctured, coolant leak detected. Full brake service required.', cost: 1850000, status: 'In Progress', mechanic_or_shop: MECHANICS[0].shop, mechanic_contact: MECHANICS[0].contact, mechanic_address: MECHANICS[0].address },
    { id: uuid(), vehicle_id: V[4].id, start_date: daysAgo(45), expected_completion_date: daysAgo(38), issues_found: 'Routine 5000 km service. Oil change, air filter replacement, tyre rotation.', cost: 650000, status: 'Completed', mechanic_or_shop: MECHANICS[1].shop, mechanic_contact: MECHANICS[1].contact, mechanic_address: MECHANICS[1].address },
    { id: uuid(), vehicle_id: V[2].id, start_date: daysAgo(60), expected_completion_date: daysAgo(55), issues_found: 'Power steering fluid leak. Replaced power steering pump. Full fluid flush.', cost: 1200000, status: 'Completed', mechanic_or_shop: MECHANICS[2].shop, mechanic_contact: MECHANICS[2].contact, mechanic_address: MECHANICS[2].address },
    { id: uuid(), vehicle_id: V[6].id, start_date: daysAgo(5),  expected_completion_date: daysAgo(1),  issues_found: 'Check engine light. OBD scan: P0420 catalyst efficiency below threshold. Catalytic converter replacement.', cost: 2400000, status: 'In Progress', mechanic_or_shop: MECHANICS[3].shop, mechanic_contact: MECHANICS[3].contact, mechanic_address: MECHANICS[3].address },
    { id: uuid(), vehicle_id: V[1].id, start_date: daysAgo(90), expected_completion_date: daysAgo(83), issues_found: 'Suspension noise on rear axle. Replaced rear shock absorbers and upper control arms.', cost: 980000, status: 'Completed', mechanic_or_shop: MECHANICS[0].shop, mechanic_contact: MECHANICS[0].contact, mechanic_address: MECHANICS[0].address },
  ];
  const { error: mE } = await supabase.from('maintenance_records').insert(maintenance);
  if (mE) console.warn('  ⚠  maintenance:', mE.message);
  console.log(`   ✅  ${maintenance.length} maintenance records`);

  // 7. ACTIVE DISPATCHES (10)
  console.log('🚀  Seeding Active Dispatches...');
  const activeDispatches = [
    { id: uuid(), driver_id: D[0].id, vehicle_id: V[0].id, corporate_account_id: A[0].id, dispatch_time: isoAgo(6),  odometer_out: 154017, fuel_level_out: 'Full',  condition_out: 'Excellent — clean, no damage noted', expected_return_date: daysAgo(-3) },
    { id: uuid(), driver_id: D[2].id, vehicle_id: V[3].id, corporate_account_id: A[1].id, dispatch_time: isoAgo(28), odometer_out: 173488, fuel_level_out: '3/4',   condition_out: 'Good — minor dust on exterior', expected_return_date: daysAgo(-1) },
    { id: uuid(), driver_id: D[4].id, vehicle_id: V[5].id, corporate_account_id: A[4].id, dispatch_time: isoAgo(3),  odometer_out: 146416, fuel_level_out: 'Full',  condition_out: 'Excellent — freshly washed', expected_return_date: daysAgo(-5) },
    { id: uuid(), driver_id: D[5].id, vehicle_id: V[1].id, corporate_account_id: A[2].id, dispatch_time: isoAgo(12), odometer_out: 139151, fuel_level_out: '1/2',   condition_out: 'Good', expected_return_date: daysAgo(-2) },
    { id: uuid(), driver_id: D[6].id, vehicle_id: V[8].id, corporate_account_id: A[5].id, dispatch_time: isoAgo(48), odometer_out: 179665, fuel_level_out: 'Full',  condition_out: 'Excellent', expected_return_date: daysAgo(-4) },
    { id: uuid(), driver_id: D[8].id, vehicle_id: V[2].id, corporate_account_id: A[3].id, dispatch_time: isoAgo(24), odometer_out: 107639, fuel_level_out: '3/4',   condition_out: 'Fair — small scratch on rear bumper', expected_return_date: daysAgo(-1) },
    { id: uuid(), driver_id: D[9].id, vehicle_id: V[9].id, corporate_account_id: A[0].id, dispatch_time: isoAgo(72), odometer_out: 163481, fuel_level_out: 'Full',  condition_out: 'Good', expected_return_date: daysAgo(-5) },
    { id: uuid(), driver_id: D[1].id, vehicle_id: V[10].id, corporate_account_id: A[1].id, dispatch_time: isoAgo(5), odometer_out: 45000, fuel_level_out: 'Full',  condition_out: 'Excellent', expected_return_date: daysAgo(-2) },
    { id: uuid(), driver_id: D[3].id, vehicle_id: V[11].id, corporate_account_id: A[2].id, dispatch_time: isoAgo(18), odometer_out: 112040, fuel_level_out: '1/2',   condition_out: 'Good', expected_return_date: daysAgo(-3) },
    { id: uuid(), driver_id: D[4].id, vehicle_id: V[4].id, corporate_account_id: A[3].id, dispatch_time: isoAgo(9),  odometer_out: 143011, fuel_level_out: '3/4',   condition_out: 'Excellent', expected_return_date: daysAgo(-1) },
  ];
  const { error: adE } = await supabase.from('active_dispatches').insert(activeDispatches);
  if (adE) console.warn('  ⚠  active_dispatches:', adE.message);
  console.log(`   ✅  ${activeDispatches.length} active dispatches`);


  // 8. TRIP LOGS + FUEL COLLECTIONS + COMPLETED DISPATCHES (10)
  console.log('📝  Seeding 30 days of Trip Logs + Fuel Collections + 10 Completed Dispatches...');

  const ACTIVE_DRIVER_IDS = D.slice(0, 7).map(d => d.id);   // first 7 (not suspended)
  const AVAILABLE_VEHICLE_IDS = V.filter(v => v.status !== 'Maintenance').map(v => v.id);

  const tripLogRows: any[] = [];
  const fuelRows: any[]    = [];
  const completedDispatches: any[] = [];

  let completedDispatchCount = 0;

  for (let day = 30; day >= 0; day--) {
    const dateStr = daysAgo(day);
    // 3-5 trips per day
    const numTrips = rand(3, 5);
    const shuffledDrivers = [...ACTIVE_DRIVER_IDS].sort(() => 0.5 - Math.random()).slice(0, numTrips);
    const shuffledVehicles = [...AVAILABLE_VEHICLE_IDS].sort(() => 0.5 - Math.random());

    shuffledDrivers.forEach((driverId, idx) => {
      const vehicleId  = shuffledVehicles[idx % shuffledVehicles.length];
      const route      = pick(ROUTES);
      const returnKm   = Math.round(route.km * (Math.random() > 0.5 ? 1.9 : 1.0));
      const totalKm    = returnKm;
      const consumed   = Number((totalKm / rand(8, 14)).toFixed(1));
      const station    = pick(FUEL_STATIONS);
      const hasIncident = Math.random() > 0.95;
      const hasSpeeding = Math.random() > 0.65;
      const hasMaint   = Math.random() > 0.93;
      const accountId  = pick(A).id;
      const projectCode = pick(PROJECT_CODES);
      const isApproved = day > 3;  // logs older than 3 days are approved, recent = pending
      const isFlagged  = !isApproved && Math.random() > 0.8;

      // Build legs
      const legs = [
        { id: uuid(), departurePoint: route.from, departureTime: `0${rand(6,9)}:${rand(0,5)}0`, destinationPoint: route.to, arrivalTime: `${rand(10,14)}:${rand(0,5)}0`, odometerStart: 100000 + rand(0, 80000), odometerEnd: 100000 + rand(80000, 180000), purposeOfTrip: route.purpose },
      ];
      if (Math.random() > 0.5) {
        legs.push({ id: uuid(), departurePoint: route.to, departureTime: `${rand(14,16)}:${rand(0,5)}0`, destinationPoint: route.from, arrivalTime: `${rand(17,20)}:${rand(0,5)}0`, odometerStart: legs[0].odometerEnd, odometerEnd: legs[0].odometerEnd + Math.round(route.km * 0.95), purposeOfTrip: 'Return to base' });
      }

      // Build passengers
      const numPax = rand(0, 3);
      const passengerPool = [...PASSENGERS_POOL].sort(() => 0.5 - Math.random()).slice(0, numPax);
      const passengers = passengerPool.map(name => ({ id: uuid(), name }));

      const logId = uuid();
      tripLogRows.push({
        id: logId,
        date: dateStr,
        driver_id: driverId,
        vehicle_id: vehicleId,
        corporate_account_id: accountId,
        project_code: projectCode,
        distance_traveled_km: totalKm,
        fuel_consumed_liters: consumed,
        incidents: hasIncident ? 1 : 0,
        speeding_events: hasSpeeding ? rand(1, 4) : 0,
        harsh_braking: Math.random() > 0.75 ? rand(1, 3) : 0,
        idling_time_hours: Number((Math.random() * 2.5).toFixed(1)),
        route_deviations: Math.random() > 0.88 ? 1 : 0,
        policy_violations: Math.random() > 0.92 ? 1 : 0,
        maintenance_issues_logged: hasMaint,
        notes: pick([
          `${route.purpose} completed without issues.`,
          `Smooth trip to ${route.to}. Client satisfied.`,
          `Road conditions fair on ${route.from} → ${route.to} route.`,
          `Minor traffic on Wilkinson Road, arrived 20 mins late.`,
          `Fuel collected at ${station.name}. Receipt attached.`,
          null, null
        ]),
        approval_status: isFlagged ? 'Flagged' : isApproved ? 'Approved' : 'Pending',
        approved_by: isApproved ? 'Admin' : null,
        approved_at: isApproved ? new Date(Date.now() - (day - 2) * 86400000).toISOString() : null,
        approval_notes: isFlagged ? 'Speeding events detected. Driver to be counselled.' : null,
        legs: JSON.stringify(legs),
        passengers: JSON.stringify(passengers),
      });

      // We need 10 completed dispatches
      if (completedDispatchCount < 10 && day < 20) { // Spread them out in recent days
         completedDispatches.push({
            id: uuid(),
            original_dispatch_id: uuid(),
            driver_id: driverId,
            vehicle_id: vehicleId,
            corporate_account_id: accountId,
            dispatch_time: new Date(Date.now() - (day + 1)*86400000 - 8*3600000).toISOString(),
            odometer_out: legs[0].odometerStart - rand(10, 50),
            fuel_level_out: pick(['Full', '3/4', '1/2']),
            condition_out: 'Good',
            expected_return_date: daysAgo(day - 2),
            completed_at: new Date(Date.now() - day*86400000).toISOString(),
            trip_log_id: logId
         });
         completedDispatchCount++;
      }

      // Fuel collection for this log
      fuelRows.push({
        id: uuid(),
        trip_log_id: logId,
        driver_id: driverId,
        station_name: station.name,
        location: station.location,
        liters: consumed + (Math.random() > 0.9 ? rand(2, 8) : 0), // slight variance for detection
        cost_per_liter: station.cpl,
        receipt_number: `RCP-${rand(10000, 99999)}`,
        date: dateStr,
      });
    });
  }

  // Insert trip logs in chunks of 50
  for (let i = 0; i < tripLogRows.length; i += 50) {
    const chunk = tripLogRows.slice(i, i + 50);
    const { error: tE } = await supabase.from('trip_logs').insert(chunk);
    if (tE) { console.error('❌ trip_logs chunk:', tE); process.exit(1); }
  }
  console.log(`   ✅  ${tripLogRows.length} trip logs`);

  // Insert completed dispatches
  const { error: cdE } = await supabase.from('completed_dispatches').insert(completedDispatches);
  if (cdE) console.warn('  ⚠  completed_dispatches:', cdE.message);
  console.log(`   ✅  ${completedDispatches.length} completed dispatches (linked to Trip Logs)`);

  // Insert fuel collections in chunks
  for (let i = 0; i < fuelRows.length; i += 50) {
    const chunk = fuelRows.slice(i, i + 50);
    const { error: fE } = await supabase.from('fuel_collections').insert(chunk);
    if (fE) { console.error('❌ fuel_collections chunk:', fE); process.exit(1); }
  }
  console.log(`   ✅  ${fuelRows.length} fuel collections`);

  // 10. INVOICES (for billing section)
  console.log('🧾  Seeding Invoices...');
  const invoices = [
    // Paid — May 2026
    { id: uuid(), account_id: A[0].id, date: '2026-06-01', period: 'May 2026', amount: 4500,  status: 'Paid',    trip_count: null },
    { id: uuid(), account_id: A[1].id, date: '2026-06-01', period: 'May 2026', amount: 4350,  status: 'Paid',    trip_count: 29   },
    { id: uuid(), account_id: A[2].id, date: '2026-06-01', period: 'May 2026', amount: 3120,  status: 'Paid',    trip_count: 26   },
    { id: uuid(), account_id: A[3].id, date: '2026-06-01', period: 'May 2026', amount: 2400,  status: 'Paid',    trip_count: 20   },
    { id: uuid(), account_id: A[4].id, date: '2026-06-01', period: 'May 2026', amount: 4200,  status: 'Paid',    trip_count: null },
    { id: uuid(), account_id: A[5].id, date: '2026-06-01', period: 'May 2026', amount: 3800,  status: 'Paid',    trip_count: null },
    // Unpaid — June 2026 (current)
    { id: uuid(), account_id: A[0].id, date: '2026-07-01', period: 'June 2026', amount: 4500,  status: 'Unpaid',  trip_count: null },
    { id: uuid(), account_id: A[1].id, date: '2026-07-01', period: 'June 2026', amount: 3150,  status: 'Unpaid',  trip_count: 21   },
    { id: uuid(), account_id: A[2].id, date: '2026-07-01', period: 'June 2026', amount: 2880,  status: 'Unpaid',  trip_count: 24   },
    { id: uuid(), account_id: A[4].id, date: '2026-07-01', period: 'June 2026', amount: 4200,  status: 'Unpaid',  trip_count: null },
    // Overdue — April 2026
    { id: uuid(), account_id: A[3].id, date: '2026-05-01', period: 'April 2026', amount: 1560, status: 'Overdue', trip_count: 13   },
    { id: uuid(), account_id: A[2].id, date: '2026-05-01', period: 'April 2026', amount: 5040, status: 'Overdue', trip_count: 28   },
  ];
  const { error: iE } = await supabase.from('invoices').insert(invoices);
  if (iE) console.warn('  ⚠  invoices:', iE.message);
  console.log(`   ✅  ${invoices.length} invoices`);

  console.log('\n🎉  Seed complete! Every section of the platform is now populated.\n');
}

seed().catch(e => { console.error('❌ Fatal:', e); process.exit(1); });
