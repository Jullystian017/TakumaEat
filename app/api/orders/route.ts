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
  addressId?: string; // Optional if using saved address
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
  promoCode?: string; // New: Promo Code support
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

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Admin check logic can be added here if needed, currently assumes User sees only their orders
    // But for Admin Orders Page, we might need a separate API or a flag.
    // Assuming this route is also used by Admin if role check passes, strictly creating for USER here based on current code.
    // For Admin API, we likely need `/api/admin/orders`. checking plan... 
    // Plan said Modify Orders API. So we might want to support admin listing here or check role.
    // Current existing code only filtered by `user_id`.

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

    // --- PROMO VALIDATION START ---
    let discountAmount = 0;
    let validPromoCode: string | null = null;

    if (body.promoCode) {
      console.info('[orders-promo] validating:', body.promoCode);
      const { data: promo, error: promoError } = await supabaseAdminClient
        .from('promos')
        .select('*')
        .eq('code', body.promoCode.toUpperCase())
        .single();

      if (promoError || !promo) {
        console.warn('[orders-promo] not found:', body.promoCode);
      } else if (!promo.is_active) {
        console.warn('[orders-promo] inactive:', body.promoCode);
      } else {
        const now = new Date();
        if (new Date(promo.start_date) > now || new Date(promo.end_date) < now) {
          console.warn('[orders-promo] expired/not-started:', body.promoCode);
        } else if (promo.usage_limit > 0 && promo.usage_count >= promo.usage_limit) {
          console.warn('[orders-promo] limit reached:', body.promoCode);
        } else if (subtotal < promo.min_purchase) {
          console.warn('[orders-promo] subtotal too low:', subtotal, '<', promo.min_purchase);
        } else {
          // Valid Promo
          validPromoCode = promo.code;
          if (promo.discount_type === 'Fixed') {
            discountAmount = promo.discount_value;
          } else {
            discountAmount = (subtotal * promo.discount_value) / 100;
            if (promo.max_discount && discountAmount > promo.max_discount) {
              discountAmount = promo.max_discount;
            }
          }
          if (discountAmount > subtotal) discountAmount = subtotal;

          console.info('[orders-promo] applied:', validPromoCode, 'discount:', discountAmount);
          // Update usage count
          await supabaseAdminClient.from('promos').update({ usage_count: promo.usage_count + 1 }).eq('id', promo.id);
        }
      }
    }
    // --- PROMO VALIDATION END ---

    const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee + codFee); // Avoid negative

    let deliveryAddress: Record<string, unknown> | null = null;
    let pickupBranchId: string | null = null;
    let scheduleAt: string | null = null;
    let notes: string | null = null;

    if (body.orderType === 'delivery') {
      const delivery = body.delivery as any;
      if (!delivery || (!delivery.addressId && (!delivery.fullName || !delivery.addressLine))) {
        return NextResponse.json({ message: 'Incomplete delivery information' }, { status: 400 });
      }

      // If using saved address system
      if (delivery.addressId) {
        const { data: addressData, error: addressError } = await supabaseAdminClient
          .from('user_addresses')
          .select('*')
          .eq('id', delivery.addressId)
          .eq('user_id', session.user.id)
          .single();

        if (addressError || !addressData) {
          return NextResponse.json({ message: 'Alamat tidak ditemukan' }, { status: 404 });
        }

        deliveryAddress = {
          fullName: addressData.recipient_name,
          phone: addressData.phone_number,
          addressLine: addressData.address_line,
          detail: addressData.detail ?? '',
          latitude: addressData.latitude,
          longitude: addressData.longitude,
          scheduleType: delivery.scheduleType,
          scheduledAt: delivery.scheduledAt ?? null,
          notes: delivery.notes ?? ''
        };
      } else {
        // Fallback for manual entry (if still allowed)
        deliveryAddress = {
          fullName: delivery.fullName,
          phone: delivery.phone,
          addressLine: delivery.addressLine,
          detail: delivery.detail ?? '',
          scheduleType: delivery.scheduleType,
          scheduledAt: delivery.scheduledAt ?? null,
          notes: delivery.notes ?? ''
        };
      }

      if (delivery.scheduleType === 'SCHEDULED' && delivery.scheduledAt) {
        scheduleAt = new Date(delivery.scheduledAt).toISOString();
      }

      notes = delivery.notes ?? null;
    } else {
      const takeaway = body.takeaway;
      if (!takeaway || typeof takeaway.branchId !== 'string' || takeaway.branchId.trim().length === 0) {
        return NextResponse.json({ message: 'Branch selection required' }, { status: 400 });
      }

      pickupBranchId = takeaway.branchId;
      notes = takeaway.notes ?? null;

      if (takeaway.pickupType === 'SCHEDULED' && takeaway.pickupAt) {
        scheduleAt = new Date(takeaway.pickupAt).toISOString();
      }
    }

    console.info('[orders] using user id', session.user.id);

    // --- PRE-ORDER VALIDATION & STOCK CHECK ---
    const validatedItems: any[] = [];

    for (const item of body.cartItems) {
      const { data: menuItem, error: fetchItemError } = await supabaseAdminClient
        .from('menu_items')
        .select('id, name, stock, status, image_url')
        .eq('name', item.name)
        .single();

      if (fetchItemError || !menuItem) {
        return NextResponse.json({ message: `Menu item ${item.name} not found` }, { status: 404 });
      }

      if (menuItem.stock < item.quantity) {
        return NextResponse.json({ message: `Stok ${item.name} tidak mencukupi (Tersisa: ${menuItem.stock})` }, { status: 400 });
      }

      validatedItems.push({ ...menuItem, orderQty: item.quantity });
    }

    // --- STOCK DEDUCTION (Internal) ---
    for (const item of validatedItems) {
      const { error: updateStockError } = await supabaseAdminClient
        .from('menu_items')
        .update({
          stock: item.stock - item.orderQty,
          status: item.stock - item.orderQty === 0 ? 'out_of_stock' : 'available'
        })
        .eq('id', item.id);

      if (updateStockError) {
        console.error(`[orders] failed to deduct stock for ${item.name}`, updateStockError);
        // Note: In a production app, we would ideally use a database transaction (RPC) to rollback if this fails.
      }
    }

    // --- CREATE ORDER RECORD ---
    const { data: orderData, error: orderError } = await supabaseAdminClient
      .from('orders')
      .insert({
        user_id: session.user.id,
        order_type: body.orderType,
        status: 'pending_payment',
        payment_method: body.paymentMethod,
        payment_status: body.paymentMethod === 'midtrans' ? 'unpaid' : 'cod_pending',
        total_amount: totalAmount,
        discount_amount: discountAmount, // NEW
        promo_code: validPromoCode,      // NEW
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

    // --- INSERT ORDER ITEMS ---
    const orderItemsPayload = body.cartItems.map((item) => {
      const dbItem = validatedItems.find((vi) => vi.name === item.name);
      return {
        order_id: orderData.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        note: item.note ?? null,
        image_url: dbItem?.image_url ?? null
      };
    });

    const { error: itemsError } = await supabaseAdminClient.from('order_items').insert(orderItemsPayload);

    if (itemsError) {
      console.error('[orders] items insert failed', itemsError);
      return NextResponse.json({ message: 'Failed to store order items' }, { status: 500 });
    }

    // --- CREATE NOTIFICATION ---
    // Logged in user notification
    await supabaseAdminClient.from('notifications').insert({
      user_id: session.user.id,
      title: 'Pesanan Dibuat',
      description: `Pesanan #${orderData.id.slice(0, 8).toUpperCase()} berhasil dibuat. Segera lakukan pembayaran.`,
      category: 'order',
      action_url: `/orders/${orderData.id}`
    });

    // Notify Admins
    const { data: adminUsers } = await supabaseAdminClient
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    if (adminUsers && adminUsers.length > 0) {
      const adminNotifications = adminUsers.map((admin) => ({
        user_id: admin.id,
        title: 'Pesanan Baru Masuk',
        description: `Ada pesanan baru #${orderData.id.slice(0, 8).toUpperCase()} sebesar ${totalAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}`,
        category: 'order',
        action_url: `/admin/orders`
      }));

      await supabaseAdminClient.from('notifications').insert(adminNotifications);
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
