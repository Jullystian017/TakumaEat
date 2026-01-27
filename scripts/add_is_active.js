
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addIsActiveColumn() {
    try {
        console.log('Adding is_active column to profiles table...');

        // We use RPC if available or just raw query if possible, but usually we just try to insert/update a dummy or check columns
        // However, the best way is using an edge function or a migration script if we have access to the DB directly.
        // In this environment, we can try to run a raw SQL via Supabase if the user has the 'postgres' role in RPC, but usually they don't.
        // Alternatively, we just try to update a test record and see if it fails.

        // Let's try to run the SQL via a hidden RPC if it exists, or just use a known method.
        // Since I can't run raw SQL easily without an RPC, I'll assume the user might need to do it or I can try to use a common RPC name.

        // For now, I'll just assume I need to tell the user or try to run it via run_command if I have the psql client.
        // Wait, I can use run_command with a custom script that uses the supabase-js to run SQL if there's an RPC.

        console.log('Note: This environment might require manual SQL execution in Supabase Dashboard:');
        console.log('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addIsActiveColumn();
