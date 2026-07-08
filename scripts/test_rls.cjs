const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, anonKey);

async function testRLS() {
  const email = 'brahiminvestment9@gmail.com';
  const password = 'MIB@123!';

  // Sign in as the super admin
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
  
  if (authError) {
    console.error('Sign in failed:', authError.message);
    return;
  }

  console.log('Signed in successfully.');

  // Try to query user_roles exactly as the frontend does
  const { data, error } = await supabase.from('user_roles').select('*');
  
  if (error) {
    console.error('RLS Error when querying user_roles:', error.message, error.details, error.hint);
  } else {
    console.log('Query successful, found', data.length, 'users.');
  }
}

testRLS();
