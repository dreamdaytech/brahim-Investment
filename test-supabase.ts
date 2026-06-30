import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  const { data, error } = await supabase.from('fuel_logs').select('*').limit(5);
  if (error) {
    console.error('Error fetching fuel_logs:', error);
  } else {
    console.log('fuel_logs:', data);
  }
}

checkTables();
