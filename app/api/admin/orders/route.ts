import { NextResponse } from 'next/server';
import { supabaseAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const search = searchParams.get('search');

        let query = supabaseAdminClient
            .from('orders')
            .select(`
        *,
        order_items (*)
      `)
            .order('created_at', { ascending: false });

        if (status && status !== 'All') {
            query = query.eq('status', status);
        }
        if (type && type !== 'All') {
            query = query.eq('order_type', type);
        }
        if (search) {
            query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%`);
        }

        const { data: orders, error } = await query;

        if (error) throw error;

        return NextResponse.json({ orders });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
