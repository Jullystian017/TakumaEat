import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { ArrowLeft, Package, Truck, ShoppingBag, CreditCard, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

import { authOptions } from '@/lib/auth-options';
import { supabaseAdminClient } from '@/lib/supabase/admin';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';

export const metadata: Metadata = {
  title: 'Order Detail | TakumaEat',
  description: 'Lihat status pesanan dan detail pengantaran atau pengambilan.'
};

type OrderDetailParams = {
  params: {
    orderId: string;
  };
};

type OrderRecord = {
  id: string;
  user_id: string;
  order_type: 'delivery' | 'takeaway';
  status: string;
  payment_method: 'midtrans' | 'cod';
  payment_status: string;
  total_amount: number;
  delivery_address: Record<string, unknown> | null;
  pickup_branch_id: string | null;
  schedule_at: string | null;
  notes: string | null;
  created_at: string;
  order_items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    note: string | null;
  }[];
};

const orderStatusLabels: Record<string, string> = {
  pending_payment: 'Menunggu pembayaran',
  processing: 'Sedang diproses',
  preparing: 'Sedang disiapkan',
  ready_for_pickup: 'Siap diambil',
  out_for_delivery: 'Sedang diantar',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  refunded: 'Dana dikembalikan'
};

const paymentStatusLabels: Record<string, string> = {
  unpaid: 'Belum dibayar',
  waiting_for_payment: 'Menunggu pembayaran',
  pending_payment: 'Menunggu pembayaran',
  pending_review: 'Menunggu verifikasi',
  paid: 'Pembayaran berhasil',
  failed: 'Pembayaran gagal',
  cancelled: 'Pembayaran dibatalkan',
  expired: 'Pembayaran kedaluwarsa',
  refunded: 'Pembayaran dikembalikan',
  partial_refund: 'Pengembalian sebagian'
};

const paymentStatusDescriptions: Record<string, string> = {
  unpaid: 'Selesaikan pembayaran melalui Midtrans untuk memproses pesanan.',
  waiting_for_payment: 'Menunggu pelanggan menyelesaikan pembayaran.',
  pending_payment: 'Menunggu pelanggan menyelesaikan pembayaran.',
  pending_review: 'Midtrans sedang meninjau transaksi, status akan diperbarui otomatis.',
  paid: 'Pesanan sedang diproses oleh tim TakumaEat.',
  failed: 'Transaksi gagal. Silakan lakukan pembayaran ulang melalui riwayat pesanan.',
  cancelled: 'Transaksi dibatalkan. Jika ini tidak disengaja, buat pesanan baru.',
  expired: 'Batas waktu pembayaran habis. Buat pesanan baru untuk melanjutkan.',
  refunded: 'Dana telah dikembalikan ke metode pembayaran yang digunakan.',
  partial_refund: 'Sebagian dana telah dikembalikan. Hubungi admin untuk detail lebih lanjut.'
};

function formatOrderStatus(status: string) {
  return orderStatusLabels[status] ?? status.replace(/_/g, ' ');
}

function formatPaymentStatus(status: string) {
  return paymentStatusLabels[status] ?? status.replace(/_/g, ' ');
}

function getPaymentStatusDescription(status: string) {
  return paymentStatusDescriptions[status] ?? 'Status pembayaran akan diperbarui otomatis.';
}

export default async function OrderDetailPage({ params }: OrderDetailParams) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    notFound();
  }

  const { data: order, error } = await supabaseAdminClient
    .from('orders')
    .select(
      `id, user_id, order_type, status, payment_method, payment_status, total_amount, delivery_address, pickup_branch_id, schedule_at, notes, created_at,
        order_items ( id, name, price, quantity, note )`
    )
    .eq('id', params.orderId)
    .maybeSingle<OrderRecord>();

  if (error || !order || order.user_id !== session.user.id) {
    notFound();
  }

  const currency = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  });

  const isDelivery = order.order_type === 'delivery';
  
  // Status badge colors (matching admin dashboard)
  const getStatusColor = (status: string) => {
    if (['pending_payment'].includes(status)) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (['processing'].includes(status)) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (['preparing', 'ready_for_pickup'].includes(status)) return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    if (['out_for_delivery'].includes(status)) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    if (['completed'].includes(status)) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (['cancelled', 'refunded'].includes(status)) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };
  
  const getPaymentStatusColor = (status: string) => {
    if (status === 'paid') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (['pending_payment', 'waiting_for_payment', 'unpaid', 'cod_pending'].includes(status)) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (['failed', 'cancelled', 'expired'].includes(status)) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-[#fdfbf7] to-white pb-24 pt-32 text-[#1f1a11]">
        <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#8d5814] transition-colors hover:text-[#a1691a]"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke pesanan
            </Link>
          </div>

          {/* Hero Status Card */}
          <div className="mb-8 overflow-hidden rounded-3xl border border-[#eadfce] bg-gradient-to-br from-white via-[#fffcf5] to-[#fff9f0] shadow-[0_20px_60px_rgba(183,150,111,0.15)]">
            <div className="border-b border-[#eadfce]/50 bg-white/80 px-6 py-4 sm:px-8 sm:py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b59c7b]">Order ID</p>
                  <h1 className="mt-1 text-2xl font-bold text-[#1f1a11] sm:text-3xl">#{order.id.slice(0, 8).toUpperCase()}</h1>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {['completed'].includes(order.status) ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    {formatOrderStatus(order.status)}
                  </span>
                  <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider ${getPaymentStatusColor(order.payment_status)}`}>
                    <CreditCard className="h-4 w-4" />
                    {formatPaymentStatus(order.payment_status)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
              <div className="flex items-center gap-4 rounded-2xl border border-[#eadfce] bg-white/60 p-4">
                {isDelivery ? <Truck className="h-8 w-8 text-[#c7812e]" /> : <ShoppingBag className="h-8 w-8 text-[#c7812e]" />}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#b59c7b]">Jenis</p>
                  <p className="mt-0.5 text-base font-bold text-[#1f1a11]">{isDelivery ? 'Delivery' : 'Takeaway'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-[#eadfce] bg-white/60 p-4">
                <Package className="h-8 w-8 text-[#c7812e]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#b59c7b]">Total Item</p>
                  <p className="mt-0.5 text-base font-bold text-[#1f1a11]">{order.order_items.length} Menu</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-[#eadfce] bg-white/60 p-4">
                <CreditCard className="h-8 w-8 text-[#c7812e]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#b59c7b]">Total</p>
                  <p className="mt-0.5 text-base font-bold text-[#1f1a11]">{currency.format(order.total_amount)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr,1fr]">
            <section className="space-y-6">
              {/* Order Items */}
              <article className="overflow-hidden rounded-3xl border border-[#eadfce] bg-white shadow-[0_20px_60px_rgba(183,150,111,0.12)]">
                <header className="border-b border-[#eadfce]/50 bg-gradient-to-r from-[#fdfbf7] to-white px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b59c7b]">Ringkasan Pesanan</p>
                      <h2 className="mt-1 text-xl font-bold text-[#1f1a11]">{order.order_items.length} Menu Dipesan</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#b59c7b]">Dibuat</p>
                      <p className="mt-1 text-sm font-semibold text-[#5c5244]">{new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p className="text-xs text-[#7b6a57]">{new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                </header>

                <div className="divide-y divide-[#eadfce]/30 p-6">
                  {order.order_items.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex items-start justify-between gap-4 ${index > 0 ? 'pt-5' : ''} ${index < order.order_items.length - 1 ? 'pb-5' : ''}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f4e7d6] text-sm font-bold text-[#8d5814]">
                            {item.quantity}
                          </span>
                          <div className="flex-1">
                            <p className="font-semibold text-[#1f1a11]">{item.name}</p>
                            <p className="mt-1 text-sm text-[#7b6a57]">{currency.format(item.price)} × {item.quantity}</p>
                            {item.note && (
                              <p className="mt-2 rounded-lg bg-[#fff9f1] px-3 py-2 text-xs text-[#7b6a57]">
                                <span className="font-semibold text-[#8d5814]">Catatan:</span> {item.note}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#1f1a11]">{currency.format(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-[#eadfce]/50 bg-gradient-to-r from-[#fdfbf7] to-white px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-wider text-[#8d5814]">Total Pesanan</p>
                    <p className="text-2xl font-bold text-[#1f1a11]">{currency.format(order.total_amount)}</p>
                  </div>
                </div>
              </article>

              {/* Fulfillment Details */}
              <article className="overflow-hidden rounded-3xl border border-[#eadfce] bg-white shadow-[0_20px_60px_rgba(183,150,111,0.12)]">
                <header className="border-b border-[#eadfce]/50 bg-gradient-to-r from-[#fdfbf7] to-white px-6 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b59c7b]">Detail Pemenuhan</p>
                  <h2 className="mt-1 text-xl font-bold text-[#1f1a11]">{isDelivery ? 'Pengiriman' : 'Ambil Sendiri'}</h2>
                </header>

                <div className="space-y-4 p-6">
                  {isDelivery && order.delivery_address ? (
                    <>
                      <div className="rounded-xl border border-[#eadfce] bg-[#fffcf5] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#a0610c]">Alamat Pengiriman</p>
                        <p className="mt-2 font-medium text-[#1f1a11]">{(order.delivery_address as { addressLine?: string }).addressLine ?? '—'}</p>
                        <p className="mt-1 text-sm text-[#7b6a57]">{(order.delivery_address as { detail?: string }).detail ?? '—'}</p>
                      </div>
                      {(order.delivery_address as { notes?: string }).notes && (
                        <div className="rounded-xl border border-[#eadfce] bg-[#fffcf5] p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#a0610c]">Catatan untuk Kurir</p>
                          <p className="mt-2 text-sm text-[#5c5244]">{(order.delivery_address as { notes?: string }).notes}</p>
                        </div>
                      )}
                      {(order.delivery_address as { scheduleType?: string }).scheduleType === 'SCHEDULED' && order.schedule_at && (
                        <div className="rounded-xl border border-[#eadfce] bg-[#fffcf5] p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#a0610c]">Waktu Pengiriman</p>
                          <p className="mt-2 font-medium text-[#1f1a11]">{new Date(order.schedule_at).toLocaleString('id-ID')}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="rounded-xl border border-[#eadfce] bg-[#fffcf5] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#a0610c]">Cabang Pengambilan</p>
                        <p className="mt-2 font-medium text-[#1f1a11]">{order.pickup_branch_id ?? 'Belum dipilih'}</p>
                      </div>
                      {order.notes && (
                        <div className="rounded-xl border border-[#eadfce] bg-[#fffcf5] p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#a0610c]">Catatan</p>
                          <p className="mt-2 text-sm text-[#5c5244]">{order.notes}</p>
                        </div>
                      )}
                      {order.schedule_at && (
                        <div className="rounded-xl border border-[#eadfce] bg-[#fffcf5] p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#a0610c]">Waktu Pengambilan</p>
                          <p className="mt-2 font-medium text-[#1f1a11]">{new Date(order.schedule_at).toLocaleString('id-ID')}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </article>
            </section>

            <aside className="space-y-6">
              {/* Payment Info */}
              <article className="overflow-hidden rounded-3xl border border-[#eadfce] bg-white shadow-[0_20px_60px_rgba(183,150,111,0.12)]">
                <header className="border-b border-[#eadfce]/50 bg-gradient-to-r from-[#fdfbf7] to-white px-6 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b59c7b]">Pembayaran</p>
                  <h2 className="mt-1 text-xl font-bold text-[#1f1a11]">{order.payment_method === 'midtrans' ? 'Midtrans' : 'Cash on Delivery'}</h2>
                </header>
                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between rounded-xl border border-[#eadfce] bg-[#fffcf5] p-4">
                    <span className="text-sm font-semibold text-[#8d5814]">Status</span>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getPaymentStatusColor(order.payment_status)}`}>
                      {formatPaymentStatus(order.payment_status)}
                    </span>
                  </div>
                  <div className="rounded-xl border border-[#eadfce] bg-[#fffcf5] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#a0610c]">Total Tagihan</p>
                    <p className="mt-2 text-2xl font-bold text-[#1f1a11]">{currency.format(order.total_amount)}</p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
                      <p className="text-sm leading-relaxed text-amber-900">
                        {order.payment_method === 'midtrans'
                          ? getPaymentStatusDescription(order.payment_status)
                          : 'Silakan lakukan pembayaran saat pengambilan pesanan.'}
                      </p>
                    </div>
                  </div>
                </div>
              </article>

              {/* Next Steps */}
              <article className="overflow-hidden rounded-3xl border border-[#eadfce] bg-white shadow-[0_20px_60px_rgba(183,150,111,0.12)]">
                <header className="border-b border-[#eadfce]/50 bg-gradient-to-r from-[#fdfbf7] to-white px-6 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b59c7b]">Informasi</p>
                  <h2 className="mt-1 text-xl font-bold text-[#1f1a11]">Langkah Selanjutnya</h2>
                </header>
                <ul className="space-y-3 p-6">
                  <li className="flex gap-3 rounded-xl border border-[#eadfce] bg-[#fffcf5] p-4">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-[#c7812e]" />
                    <span className="text-sm text-[#5c5244]">Kami akan memberikan notifikasi ketika pesanan sedang diproses, siap dikirim, atau siap diambil.</span>
                  </li>
                  <li className="flex gap-3 rounded-xl border border-[#eadfce] bg-[#fffcf5] p-4">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-[#c7812e]" />
                    <span className="text-sm text-[#5c5244]">Invoice dan riwayat pembayaran akan tersedia pada halaman ini setelah status diperbarui.</span>
                  </li>
                  <li className="flex gap-3 rounded-xl border border-[#eadfce] bg-[#fffcf5] p-4">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-[#c7812e]" />
                    <span className="text-sm text-[#5c5244]">Hubungi tim kami jika membutuhkan penyesuaian pesanan atau bantuan tambahan.</span>
                  </li>
                </ul>
              </article>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
