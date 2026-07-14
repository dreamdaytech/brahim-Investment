require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const crypto = require('crypto');

async function testTripLogInsert() {
  const syntheticLogId = crypto.randomUUID();
  const driverId = null; // simulate no driver or invalid driver
  const vehicleId = null; // simulate no vehicle

  const insertData = {
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

  console.log('Attempting to insert:', insertData);
  const { data, error } = await supabase.from('trip_logs').insert(insertData).select();
  
  if (error) {
    console.error('Trip Log Insert Error:', JSON.stringify(error, null, 2));
  } else {
    console.log('Trip Log Insert Success:', data);
    // clean up
    await supabase.from('trip_logs').delete().eq('id', syntheticLogId);
  }
}
testTripLogInsert();
