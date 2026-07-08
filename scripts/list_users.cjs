const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SERVICE_ROLE_SECRET;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function listUsers() {
  const { data, error } = await supabaseAdmin.from('user_roles').select('*').order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  
  if (data.length === 0) {
    console.log('No users found in the database.');
    return;
  }
  
  console.log('\n--- Current Users in Database ---');
  console.table(data.map(u => ({
    Name: u.full_name || '(No name set)',
    Email: u.email,
    Role: u.role,
    Status: u.is_active ? 'Active' : 'Suspended'
  })));
  console.log('---------------------------------\n');
}

listUsers();
