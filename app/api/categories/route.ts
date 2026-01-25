import { NextResponse } from 'next/server';
import { supabaseAdminClient } from '@/lib/supabase/admin';

export async function GET() {
    try {
        const { data, error } = await supabaseAdminClient
            .from('categories')
            .select('*')
            .order('priority', { ascending: false })
            .order('name');

        if (error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }

        return NextResponse.json({ categories: data });
    } catch (error) {
        return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
    }
}
