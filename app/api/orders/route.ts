import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth-options';
import { supabaseAdminClient } from '@/lib/supabase/admin';

type OrderItemInput = {
  name: string;
  price: number;
  quantity: number;
  note?: string;
};

type DeliveryPayload = {
  fullName: string;
  phone: string;
  addressLine: string;
  detail?: string;
  scheduleType: 'ASAP' | 'SCHEDULED';
  scheduledAt?: string;
  notes?: string;
};

type TakeawayPayload = {
  branchId: string;
  branchName: string;
  pickupType: 'NOW' | 'SCHEDULED';
  pickupAt?: string;
  notes?: string;
};

type CreateOrderRequest = {
  orderType: 'delivery' | 'takeaway';
  paymentMethod: 'midtrans' | 'cod';
  cartItems: OrderItemInput[];
  delivery?: DeliveryPayload;
  takeaway?: TakeawayPayload;
};

type CreateOrderResponse = {
  orderId: string;
  payment: {
    method: 'midtrans' | 'cod';
    snapToken?: string | null;
  };
};

function validateItems(items: OrderItemInput[]) {
  if (!Array.isArray(items) || items.length === 0) {
    return false;
  }

  return items.every((item) => {
    return (
      typeof item?.name === 'string' &&
      item.name.trim().length > 0 &&
      Number.isFinite(item.price) &&
      item.price >= 0 &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0 &&
      (item.note === undefined || typeof item.note === 'string')
    );
  });
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdminClient
      .from('orders')
      .select('id, status, payment_status, payment_method, order_type, total_amount, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ message: error.message ?? 'Failed to fetch orders' }, { status: 500 });
    }

    return NextResponse.json({ orders: data ?? [] });
  } catch (error) {
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as CreateOrderRequest;

    if (body.orderType !== 'delivery' && body.orderType !== 'takeaway') {
      return NextResponse.json({ message: 'Invalid order type' }, { status: 400 });
    }

    if (body.paymentMethod !== 'midtrans' && body.paymentMethod !== 'cod') {
      return NextResponse.json({ message: 'Invalid payment method' }, { status: 400 });
    }

    if (!validateItems(body.cartItems)) {
      return NextResponse.json({ message: 'Invalid cart items' }, { status: 400 });
    }

    const subtotal = body.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const deliveryFee = body.orderType === 'delivery' ? 15000 : 0;
    const codFee = body.orderType === 'takeaway' && body.paymentMethod === 'cod' ? 0 : 0;
    const totalAmount = subtotal + deliveryFee + codFee;

    let deliveryAddress: Record<string, unknown> | null = null;
    let pickupBranchId: string | null = null;
    let scheduleAt: string | null = null;
    let notes: string | null = null;

    if (body.orderType === 'delivery') {
      const delivery = body.delivery;
      if (
        !delivery ||
        typeof delivery.fullName !== 'string' ||
        typeof delivery.phone !== 'string' ||
        typeof delivery.addressLine !== 'string'
      ) {
        return NextResponse.json({ message: 'Incomplete delivery information' }, { status: 400 });
      }

      if (delivery.scheduleType === 'SCHEDULED' && !delivery.scheduledAt) {
        return NextResponse.json({ message: 'Delivery schedule required' }, { status: 400 });
      }

      deliveryAddress = {
        fullName: delivery.fullName,
        phone: delivery.phone,
        addressLine: delivery.addressLine,
        detail: delivery.detail ?? '',
        scheduleType: delivery.scheduleType,
        scheduledAt: delivery.scheduledAt ?? null,
        notes: delivery.notes ?? ''
      };

      if (delivery.scheduleType === 'SCHEDULED' && delivery.scheduledAt) {
        scheduleAt = new Date(delivery.scheduledAt).toISOString();
      }

      notes = delivery.notes ?? null;
    } else {
      const takeaway = body.takeaway;
      if (!takeaway || typeof takeaway.branchId !== 'string' || takeaway.branchId.trim().length === 0) {
        return NextResponse.json({ message: 'Branch selection required' }, { status: 400 });
      }

      if (takeaway.pickupType === 'SCHEDULED' && !takeaway.pickupAt) {
        return NextResponse.json({ message: 'Pickup schedule required' }, { status: 400 });
      }

      pickupBranchId = takeaway.branchId;
      notes = takeaway.notes ?? null;

      if (takeaway.pickupType === 'SCHEDULED' && takeaway.pickupAt) {
        scheduleAt = new Date(takeaway.pickupAt).toISOString();
      }
    }

    console.info('[orders] using user id', session.user.id);

    const { data: orderData, error: orderError } = await supabaseAdminClient
      .from('orders')
      .insert({
        user_id: session.user.id,
        order_type: body.orderType,
        status: 'pending_payment',
        payment_method: body.paymentMethod,
        payment_status: body.paymentMethod === 'midtrans' ? 'unpaid' : 'cod_pending',
        total_amount: totalAmount,
        delivery_address: deliveryAddress,
        pickup_branch_id: pickupBranchId,
        schedule_at: scheduleAt,
        notes,
        snap_token: body.paymentMethod === 'midtrans' ? 'pending' : '',
        snap_redirect_url: body.paymentMethod === 'midtrans' ? 'pending' : ''
      })
      .select('id, total_amount, delivery_address, payment_method')
      .single();

    if (orderError) {
      console.error('[orders] insert failed', orderError);
      return NextResponse.json({ message: orderError.message ?? 'Failed to create order' }, { status: 500 });
    }

    if (!orderData?.id) {
      console.error('[orders] insert returned empty data');
      return NextResponse.json({ message: 'Failed to create order' }, { status: 500 });
    }

    const orderItemsPayload = body.cartItems.map((item) => ({
      order_id: orderData.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      note: item.note ?? null
    }));

    const { error: itemsError } = await supabaseAdminClient.from('order_items').insert(orderItemsPayload);

    if (itemsError) {
      return NextResponse.json({ message: 'Failed to store order items' }, { status: 500 });
    }

    if (body.paymentMethod === 'midtrans') {
      if (!process.env.MIDTRANS_SERVER_KEY) {
        return NextResponse.json({ message: 'Midtrans is not configured' }, { status: 500 });
      }

      try {
        console.info('[orders] Creating Midtrans transaction', {
          orderId: orderData.id,
          amount: orderData.total_amount
        });
        const midtransResponse = await fetch(`${process.env.MIDTRANS_INTERNAL_URL ?? 'http://localhost:3000'}/api/payment/create-transaction`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ orderId: orderData.id })
        });

        if (!midtransResponse.ok) {
          const text = await midtransResponse.text();
          console.error('[orders] Midtrans create-transaction failed', midtransResponse.status, text);
          let message = 'Failed to create payment session';
          try {
            const parsed = JSON.parse(text) as { message?: string };
            if (parsed?.message) {
              message = parsed.message;
            }
          } catch (parseError) {
            message = text || message;
          }
          return NextResponse.json({ message }, { status: 502 });
        }

        const { token } = (await midtransResponse.json()) as { token: string };

        return NextResponse.json(
          {
            orderId: orderData.id,
            payment: {
              method: body.paymentMethod,
              snapToken: token
            }
          } satisfies CreateOrderResponse,
          { status: 201 }
        );
      } catch (error) {
        console.error('[orders] Midtrans transaction error', error);
        return NextResponse.json({ message: 'Midtrans transaction error' }, { status: 502 });
      }
    }

    return NextResponse.json(
      {
        orderId: orderData.id,
        payment: {
          method: body.paymentMethod,
          snapToken: null
        }
      } satisfies CreateOrderResponse,
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}
