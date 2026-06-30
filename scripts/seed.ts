import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// We must use SERVICE_ROLE_SECRET to bypass RLS for seeding
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SERVICE_ROLE_SECRET;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or SERVICE_ROLE_SECRET in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ==========================================
// MOCK DATA GENERATORS (Ported from UI)
// ==========================================
function generateMockDrivers() {
  return [
    { name: 'Mohamed Kamara', img_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', status: 'Active', license_expiry: '2025-12-31' },
    { name: 'Alusine Turay', img_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', status: 'Active', license_expiry: '2024-05-15' },
    { name: 'Ibrahim Bah', img_url: 'https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=150&h=150&fit=crop', status: 'Warning', license_expiry: '2024-08-20' },
  ];
}

function generateMockVehicles() {
  return [
    { make_model: 'Toyota Land Cruiser V8', year: 2021, plate_number: 'AHQ-102', status: 'Available', insurance_expiry: '2025-01-10', condition: 'Excellent', is_company_registered: true },
    { make_model: 'Nissan Patrol', year: 2019, plate_number: 'ABV-883', status: 'Available', insurance_expiry: '2024-06-30', condition: 'Good', is_company_registered: true },
    { make_model: 'Toyota Hilux Revo', year: 2022, plate_number: 'ALX-990', status: 'Maintenance', insurance_expiry: '2025-03-15', condition: 'Fair', is_company_registered: true },
  ];
}

function generateMockCorporateAccounts() {
  return [
    { name: 'UNICEF Freetown', contact_person: 'Sarah Johnson', email: 'sjohnson@unicef.org', phone: '+232 77 123456', billing_type: 'Monthly Retainer', rate: 4500, status: 'Active' },
    { name: 'Ecobank Sierra Leone', contact_person: 'David Cole', email: 'dcole@ecobank.com', phone: '+232 76 987654', billing_type: 'Per Day', rate: 120, status: 'Active' },
    { name: 'GIZ Rural Development', contact_person: 'Hans Müller', email: 'hans.muller@giz.de', phone: '+232 78 555666', billing_type: 'Per Day', rate: 150, status: 'Active' }
  ];
}

async function seedDatabase() {
  console.log('🌱 Starting Supabase database seed...');

  try {
    // 1. Seed Drivers
    console.log('Seeding Drivers...');
    const { data: drivers, error: driverError } = await supabase.from('drivers').insert(generateMockDrivers()).select();
    if (driverError) throw driverError;
    console.log(`✅ Inserted ${drivers.length} drivers.`);

    // 2. Seed Vehicles
    console.log('Seeding Vehicles...');
    const { data: vehicles, error: vehicleError } = await supabase.from('vehicles').insert(generateMockVehicles()).select();
    if (vehicleError) throw vehicleError;
    console.log(`✅ Inserted ${vehicles.length} vehicles.`);

    // 3. Seed Corporate Accounts
    console.log('Seeding Corporate Accounts...');
    const { data: accounts, error: accountError } = await supabase.from('corporate_accounts').insert(generateMockCorporateAccounts()).select();
    if (accountError) throw accountError;
    console.log(`✅ Inserted ${accounts.length} accounts.`);

    // 4. Seed Trip Logs (Linking all of them together)
    console.log('Seeding Trip Logs...');
    const mockTripLogs = [
      {
        date: new Date().toISOString().split('T')[0],
        driver_id: drivers[0].id,
        vehicle_id: vehicles[0].id,
        corporate_account_id: accounts[0].id,
        distance_traveled_km: 145.2,
        fuel_consumed_liters: 18.5,
        incidents: 0,
        speeding_events: 1,
        harsh_braking: 2,
        idling_time_hours: 1.2,
        route_deviations: 0,
        policy_violations: 0,
        maintenance_issues_logged: false,
        notes: 'Routine dropoff at Lungi Airport.'
      },
      {
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        driver_id: drivers[1].id,
        vehicle_id: vehicles[1].id,
        corporate_account_id: accounts[1].id,
        distance_traveled_km: 320.0,
        fuel_consumed_liters: 45.0,
        incidents: 1,
        speeding_events: 4,
        harsh_braking: 1,
        idling_time_hours: 3.5,
        route_deviations: 1,
        policy_violations: 0,
        maintenance_issues_logged: true,
        notes: 'Trip to Bo. Flat tire on the way back.'
      }
    ];

    const { data: trips, error: tripError } = await supabase.from('trip_logs').insert(mockTripLogs).select();
    if (tripError) throw tripError;
    console.log(`✅ Inserted ${trips.length} trip logs.`);

    console.log('🎉 Seeding Complete! All dummy data is safely in Supabase.');

  } catch (error) {
    console.error('❌ Error Seeding Database:', error);
  }
}

seedDatabase();
