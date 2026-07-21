const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Fetching active dispatches...");
  const { data: dispatches, error: dispErr } = await supabase.from('active_dispatches').select('vehicle_id');
  if (dispErr) {
    console.error("Error fetching dispatches", dispErr);
    process.exit(1);
  }
  
  const activeVehicleIds = new Set(dispatches.map(d => d.vehicle_id));
  console.log(`Found ${activeVehicleIds.size} vehicles currently assigned to active dispatches.`);

  console.log("Fetching vehicles with status 'Active Dispatch'...");
  const { data: vehicles, error: vehErr } = await supabase.from('vehicles').select('id, make_model').eq('status', 'Active Dispatch');
  if (vehErr) {
    console.error("Error fetching vehicles", vehErr);
    process.exit(1);
  }

  console.log(`Found ${vehicles.length} vehicles that have their status set to 'Active Dispatch'.`);

  let updated = 0;
  for (const v of vehicles) {
    if (!activeVehicleIds.has(v.id)) {
      console.log(`Fixing orphaned vehicle ${v.id} (${v.make_model}). Setting status to Available.`);
      const { error: updateErr } = await supabase.from('vehicles').update({ status: 'Available' }).eq('id', v.id);
      if (updateErr) {
        console.error("Failed to update", v.id, updateErr);
      } else {
        updated++;
      }
    }
  }
  
  console.log(`Completed. Updated ${updated} orphaned vehicles.`);
}

run();
