import crypto from 'crypto';

import { NextResponse } from 'next/server';

import { supabaseAdminClient } from '@/lib/supabase/admin';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

type MidtransNotificationPayload = {
  order_id?: string;
  transaction_status?: string;
  fraud_status?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
};

type StatusResolution = {
  paymentStatus: string;
  orderStatus: string;
};

function resolveStatuses(transactionStatus: string, fraudStatus?: string): StatusResolution {
  const normalizedTransaction = transactionStatus.toLowerCase();
  const normalizedFraud = fraudStatus?.toLowerCase();

  switch (normalizedTransaction) {
    case 'capture':
      if (normalizedFraud === 'challenge') {
        return { paymentStatus: 'pending_review', orderStatus: 'pending_payment' };
      }
      return { paymentStatus: 'paid', orderStatus: 'processing' };
    case 'settlement':
      return { paymentStatus: 'paid', orderStatus: 'processing' };
    case 'pending':
      return { paymentStatus: 'unpaid', orderStatus: 'pending_payment' };
    case 'deny':
      return { paymentStatus: 'failed', orderStatus: 'cancelled' };
    case 'cancel':
      return { paymentStatus: 'cancelled', orderStatus: 'cancelled' };
    case 'expire':
      return { paymentStatus: 'expired', orderStatus: 'cancelled' };
    case 'refund':
      return { paymentStatus: 'refunded', orderStatus: 'refunded' };
    case 'partial_refund':
      return { paymentStatus: 'partial_refund', orderStatus: 'refunded' };
    case 'failure':
      return { paymentStatus: 'failed', orderStatus: 'cancelled' };
    default:
      return { paymentStatus: 'unpaid', orderStatus: 'pending_payment' };
  }
}

function computeSignature(payload: MidtransNotificationPayload): string | null {
  if (!payload.order_id || !payload.status_code || !payload.gross_amount || !MIDTRANS_SERVER_KEY) {
    return null;
  }

  return crypto
    .createHash('sha512')
    .update(`${payload.order_id}${payload.status_code}${payload.gross_amount}${MIDTRANS_SERVER_KEY}`)
    .digest('hex');
}

export async function POST(request: Request) {
  if (!MIDTRANS_SERVER_KEY) {
    console.error('[midtrans] notification received without server key configured');
    return NextResponse.json({ message: 'Midtrans not configured' }, { status: 500 });
  }

  try {
    const body = (await request.json()) as MidtransNotificationPayload;

    if (!body.order_id || !body.transaction_status || !body.signature_key || !body.status_code || !body.gross_amount) {
      return NextResponse.json({ message: 'Invalid Midtrans payload' }, { status: 400 });
    }

    const expectedSignature = computeSignature(body);

    if (!expectedSignature || expectedSignature !== body.signature_key) {
      console.error('[midtrans] signature mismatch', {
        orderId: body.order_id,
        expectedSignature,
        receivedSignature: body.signature_key
      });
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
    }

    const { data: order, error: orderError } = await supabaseAdminClient
      .from('orders')
      .select('id, payment_status, status')
      .eq('id', body.order_id)
      .maybeSingle();

    if (orderError || !order) {
      console.error('[midtrans] order not found for notification', {
        orderId: body.order_id,
        error: orderError
      });
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const nextStatuses = resolveStatuses(body.transaction_status, body.fraud_status);

    // Extract specific payment channel info
    let paymentChannel = 'Midtrans';
    const payload = body as any;

    if (payload.payment_type === 'credit_card') {
      paymentChannel = `Credit Card (${payload.bank?.toUpperCase() || 'Card'})`;
    } else if (payload.payment_type === 'bank_transfer') {
      const bank = payload.va_numbers?.[0]?.bank?.toUpperCase() || payload.bank?.toUpperCase() || 'Bank Transfer';
      paymentChannel = bank;
    } else if (payload.payment_type === 'cstore') {
      paymentChannel = payload.store?.toUpperCase() || 'Convenience Store';
    } else if (payload.payment_type === 'echannel') {
      paymentChannel = 'Mandiri Bill';
    } else if (payload.payment_type) {
      // Handle QRIS, GoPay, ShopeePay etc
      paymentChannel = payload.payment_type.replace(/_/g, ' ').toUpperCase();
      if (payload.acquirer) {
        paymentChannel = `${paymentChannel} (${payload.acquirer.toUpperCase()})`;
      }
    }

    const shouldUpdateStatus =
      nextStatuses.paymentStatus !== order.payment_status || nextStatuses.orderStatus !== order.status;

    // Always update metadata if missing, or if status changed
    // Fetch current order details to check for missing metadata
    const { data: currentOrder } = await supabaseAdminClient
      .from('orders')
      .select('total_amount, tax_amount, payment_channel')
      .eq('id', order.id)
      .single();

    const shouldUpdateMetadata = !currentOrder?.payment_channel || !currentOrder?.tax_amount || currentOrder.tax_amount === 0;

    if (shouldUpdateStatus || shouldUpdateMetadata) {
      // Calculate tax (10%)
      const taxAmount = (currentOrder?.tax_amount && currentOrder.tax_amount > 0)
        ? currentOrder.tax_amount
        : Math.round((currentOrder?.total_amount || 0) * 0.1);

      const { error: updateError } = await supabaseAdminClient
        .from('orders')
        .update({
          payment_status: nextStatuses.paymentStatus,
          status: nextStatuses.orderStatus,
          payment_channel: currentOrder?.payment_channel || paymentChannel,
          tax_amount: taxAmount
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('[midtrans] failed to update order status', {
          orderId: order.id,
          nextStatuses,
          error: updateError
        });
        return NextResponse.json({ message: 'Failed to update order status' }, { status: 500 });
      }

      console.info('[midtrans] order status/metadata updated', {
        orderId: order.id,
        paymentChannel,
        shouldUpdateStatus,
        shouldUpdateMetadata,
        nextStatuses
      });

      // 3. Create notification for the user
      try {
        const { data: orderData } = await supabaseAdminClient
          .from('orders')
          .select('user_id, order_number')
          .eq('id', order.id)
          .single();

        if (orderData) {
          let title = 'Update Pembayaran';
          let description = `Status pembayaran pesanan ${orderData.order_number} telah diperbarui menjadi ${nextStatuses.paymentStatus}.`;

          if (nextStatuses.paymentStatus === 'paid') {
            title = 'Pembayaran Berhasil!';
            description = `Terima kasih! Pembayaran untuk pesanan ${orderData.order_number} telah kami terima.`;
          } else if (nextStatuses.paymentStatus === 'failed' || nextStatuses.paymentStatus === 'expired') {
            title = 'Pembayaran Gagal';
            description = `Maaf, pembayaran untuk pesanan ${orderData.order_number} tidak berhasil atau telah kadaluarsa.`;
          }

          await supabaseAdminClient
            .from('notifications')
            .insert([{
              user_id: orderData.user_id,
              title,
              description,
              category: 'payment',
              status: 'unread',
              action_url: `/orders/${order.id}`
            }]);
        }
      } catch (notifErr) {
        console.error('[midtrans] failed to create notification', notifErr);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[midtrans] notification handler error', error);
    return NextResponse.json({ message: 'Midtrans notification error' }, { status: 500 });
  }
}
