const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, 'supabase', 'migrations', '20260807_expense_categories.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL into individual statements safely (by semicolon not in string)
    // For simplicity, we just use rpc or send commands. 
    // Since supabase js client doesn't run raw multi-statement SQL easily without RPC, 
    // we'll run the simple statements using a helper or just execute them individually using an RPC if one exists, 
    // or just instruct the user to run it if it fails.
    
    // As a workaround for client-side raw SQL execution missing, let's create an RPC or execute queries directly via REST if possible.
    // Wait, let's just use the 'exec_sql' RPC if they have one. 
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
    
    if (error) {
       console.log("Could not use exec_sql RPC, attempting fallback via REST for individual inserts...");
       console.log("Error details:", error.message);
       // We can't do CREATE TABLE from standard REST easily without admin key.
       console.log("Please run `supabase/migrations/20260807_expense_categories.sql` in the Supabase SQL editor directly.");
    } else {
       console.log("Migration applied successfully!");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

runMigration();
