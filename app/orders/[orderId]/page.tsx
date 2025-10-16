import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { ArrowLeft } from 'lucide-react';

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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#fdf9f1] pb-24 pt-32 text-[#1f1a11]">
        <section className="mx-auto w-full max-w-5xl px-6">
          <header className="space-y-3 border-b border-[#d0bfa6]/40 pb-6">
            <div>
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#8d5814] transition-colors hover:text-[#a1691a]"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke pesanan
              </Link>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f4e7d6] px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8d5814]">
              Order Detail
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-[#1f1a11] sm:text-4xl">Pesanan #{order.id.slice(0, 8).toUpperCase()}</h1>
            <p className="text-sm text-[#5c5244]">
              Status saat ini: <strong className="text-[#8d5814]">{formatOrderStatus(order.status)}</strong>
            </p>
          </header>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <section className="space-y-6">
              <article className="rounded-3xl border border-[#eadfce] bg-white p-6 shadow-[0_28px_60px_rgba(183,150,111,0.18)]">
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b59c7b]">Ringkasan Pesanan</p>
                  <h2 className="text-lg font-semibold text-[#1f1a11]">{order.order_items.length} item dipesan</h2>
                </div>
                <p className="text-sm text-[#7b6a57]">Dibuat pada {new Date(order.created_at).toLocaleString('id-ID')}</p>
              </header>

              <div className="mt-6 space-y-4">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-[#eadfce] bg-[#fff9f1] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1f1a11]">{item.name}</p>
                      <p className="text-xs text-[#7b6a57]">Qty {item.quantity}</p>
                      {item.note && <p className="mt-1 text-xs text-[#9a8871]">Catatan: {item.note}</p>}
                    </div>
                    <p className="text-sm font-semibold text-[#1f1a11]">{currency.format(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-[#eadfce] bg-white p-6 shadow-[0_28px_60px_rgba(183,150,111,0.18)]">
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b59c7b]">Jenis Pemenuhan</p>
                  <h2 className="text-lg font-semibold text-[#1f1a11]">{isDelivery ? 'Delivery' : 'Takeaway'}</h2>
                </div>
              </header>

              <div className="mt-6 space-y-4 text-sm text-[#5c5244]">
                {isDelivery && order.delivery_address ? (
                  <>
                    <p>Alamat: {(order.delivery_address as { addressLine?: string }).addressLine ?? '—'}</p>
                    <p>Detail: {(order.delivery_address as { detail?: string }).detail ?? '—'}</p>
                    <p>Catatan: {(order.delivery_address as { notes?: string }).notes ?? 'Tidak ada'}</p>
                    {(order.delivery_address as { scheduleType?: string }).scheduleType === 'SCHEDULED' && (
                      <p>Terjadwal: {order.schedule_at ? new Date(order.schedule_at).toLocaleString('id-ID') : 'Menunggu konfirmasi'}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p>Cabang: {order.pickup_branch_id ?? 'Belum dipilih'}</p>
                    <p>Catatan: {order.notes ?? 'Tidak ada'}</p>
                    {order.schedule_at && <p>Waktu ambil: {new Date(order.schedule_at).toLocaleString('id-ID')}</p>}
                  </>
                )}
              </div>
              </article>
            </section>

            <aside className="space-y-6">
              <article className="rounded-3xl border border-[#eadfce] bg-white p-6 shadow-[0_28px_60px_rgba(183,150,111,0.18)]">
              <header className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b59c7b]">Pembayaran</p>
                <h2 className="text-lg font-semibold text-[#1f1a11]">Metode: {order.payment_method.toUpperCase()}</h2>
              </header>
              <div className="mt-4 space-y-2 text-sm text-[#5c5244]">
                <p>Status pembayaran: {formatPaymentStatus(order.payment_status)}</p>
                <p>Total tagihan: {currency.format(order.total_amount)}</p>
                <p>{order.payment_method === 'midtrans' ? getPaymentStatusDescription(order.payment_status) : 'Silakan lakukan pembayaran saat pengambilan pesanan.'}</p>
              </div>
            </article>

            <article className="rounded-3xl border border-[#eadfce] bg-white p-6 shadow-[0_28px_60px_rgba(183,150,111,0.18)]">
              <header className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b59c7b]">Langkah selanjutnya</p>
                <h2 className="text-lg font-semibold text-[#1f1a11]">Pantau status order</h2>
              </header>
              <div className="mt-4 space-y-3 text-sm text-[#5c5244]">
                <p>• Kami akan memberi tahu jika pesananmu sedang diproses, siap diantar, atau siap diambil.</p>
                <p>• Kamu dapat melihat riwayat pembayaran dan invoice pada halaman ini setelah konfirmasi.</p>
              </div>
              </article>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
