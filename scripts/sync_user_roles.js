
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncRoles() {
    try {
        console.log('Checking for users with old role "user"...');

        const { data: users, error: fetchError } = await supabase
            .from('profiles')
            .select('id, email, role')
            .eq('role', 'user');

        if (fetchError) throw fetchError;

        if (!users || users.length === 0) {
            console.log('No users found with old role "user". Full synchronization already complete.');
            return;
        }

        console.log(`Found ${users.length} users with old role. Updating to "customer"...`);

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'customer' })
            .eq('role', 'user');

        if (updateError) throw updateError;

        console.log('Successfully synchronized all roles to "customer"!');

    } catch (error) {
        console.error('Error:', error);
    }
}

syncRoles();
