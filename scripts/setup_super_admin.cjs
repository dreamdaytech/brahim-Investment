const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SERVICE_ROLE_SECRET;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupSuperAdmin() {
  const email = 'brahiminvestment9@gmail.com';
  const password = 'MIB@123!';

  console.log(`Setting up super admin for: ${email}`);

  // 1. Try to create the user
  const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true // Force confirm so they can log in immediately
  });

  let userId;

  if (createError) {
    if (createError.message.includes('already registered')) {
      console.log('User already exists. Attempting to fetch user ID and update password...');
      
      // We need to find the user's ID to update their password via admin API
      // We can query auth.users if we use postgres, or we can use admin.listUsers
      const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) {
        console.error('Error fetching users:', listError);
        return;
      }
      
      const user = usersData.users.find(u => u.email === email);
      if (user) {
        userId = user.id;
        
        // Update password
        const { error: updateAuthErr } = await supabaseAdmin.auth.admin.updateUserById(userId, { password });
        if (updateAuthErr) console.error('Error updating password:', updateAuthErr);
        else console.log('Password updated successfully.');
      } else {
        console.error('User not found in list, unable to update.');
        return;
      }
    } else {
      console.error('Error creating user:', createError);
      return;
    }
  } else {
    console.log('User created successfully.');
    userId = userData.user.id;
    // Wait for the Postgres trigger to create the user_roles row
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // 2. Update the user's role to super_admin in user_roles
  console.log(`Assigning super_admin role to user ID: ${userId}`);
  const { error: roleError } = await supabaseAdmin
    .from('user_roles')
    .update({ role: 'super_admin', full_name: 'Super Admin' })
    .eq('id', userId);

  if (roleError) {
    console.error('Error updating user_roles:', roleError);
    // If the trigger failed or didn't run, try inserting manually
    console.log('Attempting manual insert into user_roles...');
    const { error: insertErr } = await supabaseAdmin
      .from('user_roles')
      .insert({ id: userId, email, role: 'super_admin', full_name: 'Super Admin' });
    if (insertErr) console.error('Failed manual insert:', insertErr);
    else console.log('Manual insert succeeded.');
  } else {
    console.log('Role updated to super_admin successfully!');
  }
}

setupSuperAdmin();
