import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth-options';
import { supabaseAdminClient } from '@/lib/supabase/admin';

const allowedPaymentStatuses = [
  'unpaid',
  'waiting_for_payment',
  'pending_payment',
  'pending_review',
  'paid',
  'failed',
  'cancelled',
  'expired',
  'refunded',
  'partial_refund',
  'cod_pending'
] as const;

const allowedOrderStatuses = [
  'pending_payment',
  'processing',
  'preparing',
  'ready_for_pickup',
  'out_for_delivery',
  'completed',
  'cancelled',
  'refunded'
] as const;

type AllowedPaymentStatus = (typeof allowedPaymentStatuses)[number];
type AllowedOrderStatus = (typeof allowedOrderStatuses)[number];

type UpdateStatusRequest = {
  paymentStatus?: AllowedPaymentStatus;
  status?: AllowedOrderStatus;
};

type Params = {
  params: {
    orderId: string;
  };
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
    }

    const body = (await request.json().catch(() => ({}))) as UpdateStatusRequest;

    if (!body.paymentStatus && !body.status) {
      return NextResponse.json({ message: 'No status provided' }, { status: 400 });
    }

    if (body.paymentStatus && !allowedPaymentStatuses.includes(body.paymentStatus)) {
      return NextResponse.json({ message: 'Invalid payment status' }, { status: 400 });
    }

    if (body.status && !allowedOrderStatuses.includes(body.status)) {
      return NextResponse.json({ message: 'Invalid order status' }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabaseAdminClient
      .from('orders')
      .select('id, user_id, payment_status, status')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    if (order.user_id !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const payload: Partial<{ payment_status: AllowedPaymentStatus; status: AllowedOrderStatus }> = {};

    if (body.paymentStatus) {
      payload.payment_status = body.paymentStatus;
    }

    if (body.status) {
      payload.status = body.status;
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ message: 'No changes detected' }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabaseAdminClient
      .from('orders')
      .update(payload)
      .eq('id', order.id)
      .select('id, status, payment_status, payment_method, order_type, total_amount, created_at')
      .maybeSingle();

    if (updateError || !updated) {
      return NextResponse.json({ message: updateError?.message ?? 'Failed to update order' }, { status: 500 });
    }

    return NextResponse.json({ order: updated });
  } catch (error) {
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}
