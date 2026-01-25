import { NextResponse } from 'next/server';
import { supabaseAdminClient } from '@/lib/supabase/admin';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { status } = await request.json();
        const id = params.id;

        // 1. Update order status
        const { data: order, error: updateError } = await supabaseAdminClient
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select().single();

        if (updateError) throw updateError;

        // 2. Create notification for the user
        // Determine title and description based on status
        let title = 'Update Pesanan';
        let description = `Status pesanan ${order.order_number} telah berubah menjadi ${status}`;

        if (status === 'Diproses') {
            title = 'Pesanan Diproses';
            description = `Pesanan ${order.order_number} sedang disiapkan oleh koki kami.`;
        } else if (status === 'Siap') {
            title = 'Pesanan Siap';
            description = `Pesanan ${order.order_number} siap diambil/dikirim!`;
        } else if (status === 'Dikirim') {
            title = 'Pesanan Dikirim';
            description = `Pesanan ${order.order_number} sedang dalam perjalanan ke lokasimu.`;
        } else if (status === 'Selesai') {
            title = 'Selamat Menikmati';
            description = `Terima kasih telah memesan di TakumaEat!`;
        }

        await supabaseAdminClient
            .from('notifications')
            .insert([{
                user_id: order.user_id,
                title,
                description,
                category: 'order',
                status: 'unread',
                action_url: `/orders/${order.id}`
            }]);

        return NextResponse.json({ order });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
