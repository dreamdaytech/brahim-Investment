require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const crypto = require('crypto');

async function testRealInsert() {
  const syntheticLogId = crypto.randomUUID();
  const fuelCollectionId = crypto.randomUUID();

  // We need a real driver and vehicle ID to satisfy foreign keys!
  const { data: drivers } = await supabase.from('drivers').select('id').limit(1);
  const { data: vehicles } = await supabase.from('vehicles').select('id').limit(1);
  
  if (!drivers?.length || !vehicles?.length) {
    console.error('No drivers or vehicles found!');
    return;
  }
  
  const driverId = drivers[0].id;
  const vehicleId = vehicles[0].id;

  const logInsert = {
    id: syntheticLogId,
    date: new Date().toISOString().split('T')[0],
    driver_id: driverId,
    vehicle_id: vehicleId,
    distance_traveled_km: 0,
    fuel_consumed_liters: 0,
    fuel_issued_liters: 0,
    fuel_cost_per_liter: 0,
    incidents: 0, speeding_events: 0, harsh_braking: 0,
    idling_time_hours: 0, route_deviations: 0, policy_violations: 0,
    maintenance_issues_logged: false,
    notes: 'Standalone fuel entry test',
    approval_status: 'Pending',
  };

  const fuelRow = {
    id: fuelCollectionId,
    trip_log_id: syntheticLogId,
    driver_id: driverId,
    vehicle_id: vehicleId,
    station_name: 'Test',
    location: 'Juba',
    date: new Date().toISOString().split('T')[0],
    time: null,
    supplier: null,
    is_partner_station: true,
    district: null,
    liters: 10,
    cost_per_liter: 10,
    total_cost: 100,
    fuel_type: null,
    payment_method: null,
    receipt_number: null,
    notes: null,
    remarks: null,
  };

  console.log('Inserting trip log...');
  const { error: logErr } = await supabase.from('trip_logs').insert(logInsert);
  if (logErr) {
    console.error('Log Insert Err:', JSON.stringify(logErr, null, 2));
    return;
  }

  console.log('Inserting fuel collection...');
  const { data, error: fcErr } = await supabase.from('fuel_collections').insert(fuelRow).select();
  if (fcErr) {
    console.error('Fuel Insert Err:', JSON.stringify(fcErr, null, 2));
  } else {
    console.log('Fuel Insert Success:', data);
    await supabase.from('fuel_collections').delete().eq('id', fuelCollectionId);
  }

  await supabase.from('trip_logs').delete().eq('id', syntheticLogId);
}
testRealInsert();
