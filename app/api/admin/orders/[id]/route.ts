import { NextResponse } from 'next/server';
import { supabaseAdminClient } from '@/lib/supabase/admin';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        const { data: order, error: orderError } = await supabaseAdminClient
            .from('orders')
            .select(`
                *,
                users:profiles (name, email)
            `)
            .eq('id', id)
            .single();

        if (orderError) throw orderError;

        const { data: items, error: itemsError } = await supabaseAdminClient
            .from('order_items')
            .select(`
                id,
                name,
                price,
                quantity,
                note,
                image_url
            `)
            .eq('order_id', id);

        if (itemsError) throw itemsError;

        return NextResponse.json({ order, items });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { status, payment_status } = await request.json();
        const id = params.id;

        const updates: any = {};
        if (status) updates.status = status;
        if (payment_status) updates.payment_status = payment_status;

        const { data: order, error: updateError } = await supabaseAdminClient
            .from('orders')
            .update(updates)
            .eq('id', id)
            .select().single();

        if (updateError) throw updateError;

        // Create notification for status change
        if (status) {
            await supabaseAdminClient
                .from('notifications')
                .insert([{
                    user_id: order.user_id,
                    title: 'Update Pesanan',
                    description: `Status pesanan #${order.id.slice(0, 8).toUpperCase()} telah berubah menjadi ${status}`,
                    category: 'order',
                    status: 'unread',
                    action_url: `/orders/${order.id}`
                }]);
        }

        // Create notification for payment change
        if (payment_status === 'paid') {
            await supabaseAdminClient
                .from('notifications')
                .insert([{
                    user_id: order.user_id,
                    title: 'Pembayaran Diterima',
                    description: `Pembayaran untuk pesanan #${order.id.slice(0, 8).toUpperCase()} telah dikonfirmasi.`,
                    category: 'order',
                    status: 'unread',
                    action_url: `/orders/${order.id}`
                }]);
        }

        return NextResponse.json({ order });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // items are typically cascaded, but just in case:
        await supabaseAdminClient.from('order_items').delete().eq('order_id', id);

        const { error } = await supabaseAdminClient
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Order deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
