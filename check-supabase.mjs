import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oxxdkxsjnhpbprmjxtgs.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94eGRreHNqbmhwYnBybWp4dGdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjE1MzAwOSwiZXhwIjoyMDk3NzI5MDA5fQ.ZnXs1gi4xn77EruMFohA2tDTdNm4zorO0vzuIvneJdI';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const tablesToCheck = [
  'drivers',
  'vehicles',
  'active_dispatches',
  'maintenance_records',
  'trip_logs',
  'fuel_collections',
  'driver_status_logs',
  'completed_dispatches',
  'fuel_cities',
  'fuel_stations'
];

async function checkSupabase() {
  console.log('Checking Supabase tables...');
  
  for (const table of tablesToCheck) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log(`❌ Table missing: ${table}`);
      } else {
        console.log(`⚠️ Error on ${table}: ${error.message} (Code: ${error.code})`);
      }
    } else {
      console.log(`✅ Table exists: ${table} (Contains data? ${data.length > 0 ? 'Yes' : 'No'})`);
    }
  }

  // Check RPC
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_driver_scores');
  if (rpcError) {
    console.log(`❌ RPC missing or error: get_driver_scores - ${rpcError.message}`);
  } else {
    console.log(`✅ RPC exists: get_driver_scores`);
  }
}

checkSupabase();
