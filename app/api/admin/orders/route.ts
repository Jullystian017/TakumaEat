import { NextResponse } from 'next/server';
import { supabaseAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const search = searchParams.get('search');

        // Note: Joining with 'users' assumes a foreign key relationship exists. 
        // If it's a separate auth system, we might need a separate profile table or distinct join logic.
        // Assuming 'users' table exists and has id, name, email.
        let query = supabaseAdminClient
            .from('orders')
            .select(`
                *,
                users:profiles (name, email)
            `)
            .order('created_at', { ascending: false });

        if (status && status !== 'All') {
            query = query.eq('status', status);
        }
        if (type && type !== 'All') {
            query = query.eq('order_type', type);
        }

        // If search is used, filtering by order number or customer name (from joint user table if possible, or manual field)
        // Adjusting or filter to handle joined data search might require RPC or complex query.
        // For now, filtering by order_id or notes/address.
        if (search) {
            query = query.or(`id.ilike.%${search}%,notes.ilike.%${search}%`);
        }

        const { data: orders, error } = await query;

        if (error) throw error;

        return NextResponse.json({ orders });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
