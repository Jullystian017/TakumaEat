import { NextResponse } from 'next/server';
import { supabaseAdminClient } from '@/lib/supabase/admin';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? 'SB-Mid-server-5gd9KJVkX4lOk1dBR8-d1Boa';
const MIDTRANS_BASE_URL = process.env.MIDTRANS_BASE_URL ?? 'https://app.sandbox.midtrans.com';
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

if (!MIDTRANS_SERVER_KEY) {
  console.warn('[Midtrans] MIDTRANS_SERVER_KEY is not set. Midtrans integration will fail.');
}

async function createMidtransTransaction(payload: Record<string, unknown>) {
  const response = await fetch(`${MIDTRANS_BASE_URL}/snap/v1/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64')}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Midtrans error: ${response.status} ${errorBody}`);
  }

  return (await response.json()) as {
    token: string;
    redirect_url: string;
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      orderId: string;
    };

    if (!body?.orderId) {
      return NextResponse.json({ message: 'orderId is required' }, { status: 400 });
    }

    const { data: order, error } = await supabaseAdminClient
      .from('orders')
      .select('id, total_amount, user_id, order_type, delivery_address')
      .eq('id', body.orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const finishUrl = `${APP_BASE_URL}/orders/${order.id}`;

    const response = await createMidtransTransaction({
      transaction_details: {
        order_id: order.id,
        gross_amount: order.total_amount
      },
      customer_details: {
        first_name: order.delivery_address?.fullName ?? 'TakumaEat Customer'
      },
      callbacks: {
        finish: finishUrl,
        error: finishUrl,
        unfinish: finishUrl
      }
    });

    await supabaseAdminClient
      .from('orders')
      .update({ snap_token: response.token, snap_redirect_url: response.redirect_url })
      .eq('id', order.id);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[Midtrans] create-transaction failed', error);
    return NextResponse.json({ message: 'Failed to create Midtrans transaction' }, { status: 500 });
  }
}
