const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oxxdkxsjnhpbprmjxtgs.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94eGRreHNqbmhwYnBybWp4dGdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjE1MzAwOSwiZXhwIjoyMDk3NzI5MDA5fQ.ZnXs1gi4xn77EruMFohA2tDTdNm4zorO0vzuIvneJdI';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkSchema() {
  console.log('Checking maintenance_records...');
  const { data: recordsData, error: recordsError } = await supabase.from('maintenance_records').select('*').limit(1);
  if (recordsError) {
    console.error('Error fetching maintenance_records:', recordsError.message);
  } else {
    console.log('maintenance_records exists. Data:', recordsData);
  }

  console.log('Checking suppliers...');
  const { data: suppliersData, error: suppliersError } = await supabase.from('suppliers').select('*').limit(1);
  if (suppliersError) {
    console.error('Error fetching suppliers:', suppliersError.message);
  } else {
    console.log('suppliers exists. Data:', suppliersData);
  }
}

checkSchema();
