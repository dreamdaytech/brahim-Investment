import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTripApprovals() {
  const { data, error } = await supabase.from('trip_logs').select('approval_status');
  if (error) {
    console.error('Error fetching trip_logs:', error);
    return;
  }
  
  const stats = data.reduce((acc, log) => {
    const status = log.approval_status || 'Pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  console.log('Trip Approvals Status:', stats);
  console.log('Total Trips:', data.length);
}

checkTripApprovals();
