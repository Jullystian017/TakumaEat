import { NextResponse } from 'next/server';
import { supabaseAdminClient } from '@/lib/supabase/admin';

export async function GET() {
    try {
        const { data: users, error } = await supabaseAdminClient
            .from('profiles')
            .select('id, name, email, role, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ users });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
