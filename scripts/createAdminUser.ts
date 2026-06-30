import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const serviceRoleKey = process.env.SERVICE_ROLE_SECRET!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createAdminUser() {
  const email = 'admin@dreamday.com';
  const password = 'AdminPassword123!';

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) {
    console.error('Failed to create admin user:', error.message);
  } else {
    console.log(`✅ Successfully created admin user!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  }
}

createAdminUser();
