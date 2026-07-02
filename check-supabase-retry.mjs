import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oxxdkxsjnhpbprmjxtgs.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94eGRreHNqbmhwYnBybWp4dGdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjE1MzAwOSwiZXhwIjoyMDk3NzI5MDA5fQ.ZnXs1gi4xn77EruMFohA2tDTdNm4zorO0vzuIvneJdI';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const tablesToCheck = ['drivers', 'vehicles', 'active_dispatches'];

async function checkSupabase() {
  console.log('Checking problematic tables...');
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ Table missing or error: ${table} - ${error.message} (Code: ${error.code})`);
      } else {
        console.log(`✅ Table exists: ${table} (Contains data? ${data.length > 0 ? 'Yes' : 'No'})`);
      }
    } catch (err) {
      console.log(`Fetch error on ${table}:`, err);
    }
  }
}

checkSupabase();
