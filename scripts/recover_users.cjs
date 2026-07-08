const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SERVICE_ROLE_SECRET;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function recoverMissingUsers() {
  console.log('Fetching all users from auth.users...');
  
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (authError) {
    console.error('Failed to list auth users:', authError);
    return;
  }
  
  console.log(`Found ${authData.users.length} total registered users.`);
  
  let recoveredCount = 0;
  
  for (const user of authData.users) {
    // Check if they exist in user_roles
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('id', user.id)
      .single();
      
    if (!roleData) {
      console.log(`User ${user.email} is missing from user_roles! Recovering...`);
      
      const { error: upsertErr } = await supabaseAdmin.from('user_roles').upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email.split('@')[0],
        role: 'fleet_manager', // default role
        is_active: true
      });
      
      if (upsertErr) {
        console.error(`Failed to recover ${user.email}:`, upsertErr);
      } else {
        console.log(`Successfully recovered ${user.email}!`);
        recoveredCount++;
      }
    }
  }
  
  console.log(`Recovery complete. ${recoveredCount} users were restored to the Access Control table.`);
}

recoverMissingUsers();
