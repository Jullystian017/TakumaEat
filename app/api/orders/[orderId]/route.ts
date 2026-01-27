import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { supabaseAdminClient } from '@/lib/supabase/admin';

export async function GET(
    request: Request,
    { params }: { params: { orderId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { orderId } = params;

        // Fetch order with user check and branch name join
        const { data: order, error: orderError } = await supabaseAdminClient
            .from('orders')
            .select(`
                *,
                branches:pickup_branch_id (name)
            `)
            .eq('id', orderId)
            .eq('user_id', session.user.id)
            .single();

        if (orderError) {
            console.error('[order-detail-api] fetch order error:', orderError);
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        // Fetch order items
        const { data: items, error: itemsError } = await supabaseAdminClient
            .from('order_items')
            .select('*')
            .eq('order_id', orderId);

        if (itemsError) {
            console.error('[order-detail-api] fetch items error:', itemsError);
            return NextResponse.json({ message: 'Failed to fetch order items' }, { status: 500 });
        }

        return NextResponse.json({ order, items });
    } catch (error: any) {
        console.error('[order-detail-api] unexpected error:', error);
        return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
    }
}
