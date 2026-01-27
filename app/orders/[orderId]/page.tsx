import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import {
  ArrowLeft,
  Package,
  Truck,
  ShoppingBag,
  CreditCard,
  Clock,
  CheckCircle2,
  MapPin,
  Store,
  UtensilsCrossed,
  Info,
  Tag
} from 'lucide-react';

import { authOptions } from '@/lib/auth-options';
import { supabaseAdminClient } from '@/lib/supabase/admin';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Detail Pesanan | TakumaEat',
  description: 'Lihat status pesanan dan detail lengkap transaksi kamu.'
};

type OrderDetailParams = {
  params: {
    orderId: string;
  };
};

const statusLabels: Record<string, string> = {
  pending_payment: "Menunggu pembayaran",
  processing: "Sedang diproses",
  preparing: "Sedang disiapkan",
  ready_for_pickup: "Siap diambil",
  out_for_delivery: "Sedang diantar",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  refunded: "Dana dikembalikan"
};

const paymentLabels: Record<string, string> = {
  unpaid: "Belum dibayar",
  waiting_for_payment: "Menunggu pembayaran",
  pending_payment: "Menunggu pembayaran",
  pending_review: "Menunggu verifikasi",
  paid: "Lunas",
  failed: "Gagal",
  cancelled: "Dibatalkan",
  expired: "Kedaluwarsa",
  refunded: "Refund",
  partial_refund: "Refund Sebagian",
  cod_pending: "Bayar di Tempat"
};

export default async function OrderDetailPage({ params }: OrderDetailParams) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    notFound();
  }

  // Fetch with branch name join
  const { data: order, error } = await supabaseAdminClient
    .from('orders')
    .select(`
        *,
        branches:pickup_branch_id (name),
        order_items (*)
    `)
    .eq('id', params.orderId)
    .maybeSingle();

  if (error || !order || order.user_id !== session.user.id) {
    notFound();
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const isDelivery = order.order_type === 'delivery';

  return (
    <>
      <Navbar />
      <main className="min-h-screen relative bg-[#fdfbf7] pb-24 pt-32 text-[#1f1a11] overflow-hidden">
        {/* Premium Background Decoration */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#eadfce_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] opacity-40" />
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-gold/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-gold/5 blur-[120px] rounded-full" />
        </div>

        <section className="mx-auto w-full max-w-3xl px-4 sm:px-6 relative z-10">
          <div className="mb-6">
            <Link
              href="/orders"
              className="group flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-[#b59c7b] transition-all hover:text-[#1f1a11]"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              Kembali
            </Link>
          </div>

          {/* Compact Receipt Container */}
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(31,26,17,0.05)] border border-[#eadfce]/30">

            {/* Premium Dark Header (Integrated style) */}
            <div className="bg-[#1f1a11] p-8 sm:p-10 text-white relative">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between relative z-10">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-gold">TRANSACTION CODE</p>
                    <span className={cn(
                      "rounded-lg px-2.5 py-1 text-[8px] font-black uppercase tracking-widest border border-white/10",
                      order.status === 'completed' ? "bg-emerald-500/20 text-emerald-400" : "bg-brand-gold/20 text-brand-gold"
                    )}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <h1 className="text-4xl font-black tracking-tighter sm:text-5xl italic text-white">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </h1>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    {new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <div className="sm:text-right hidden sm:block relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 bg-brand-gold/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="h-20 w-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl relative z-10">
                    <ShoppingBag size={40} className="text-brand-gold" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
              {/* Visual decoration */}
              <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
            </div>

            {/* Main Info Area - More Compact */}
            <div className="p-8 sm:p-10 space-y-10">

              {/* Quick Info Grid */}
              <div className="grid gap-12 sm:grid-cols-2 text-xs">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-brand-gold" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#b59c7b]">LOGISTIK & PENERIMA</p>
                  </div>
                  {isDelivery ? (
                    <div className="space-y-1.5 pl-4 flex flex-col">
                      <p className="text-sm font-black uppercase text-[#1f1a11] tracking-tight">{order.delivery_address?.fullName}</p>
                      <p className="text-sm font-semibold text-[#5c5244] opacity-80 leading-relaxed italic pr-4">
                        {order.delivery_address?.addressLine}
                      </p>
                      <p className="text-[10px] font-black text-[#b59c7b] pt-1 tracking-[0.2em]">CONTACT: {order.delivery_address?.phone}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 pl-4">
                      <p className="text-sm font-black uppercase text-[#1f1a11] tracking-tight">{order.branches?.name || "TakumaEat Central Hub"}</p>
                      <div className="flex items-center gap-2 text-[#5c5244] opacity-70 italic text-[11px]">
                        <Store size={14} />
                        <span>Pick up directly at the outlet</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4 sm:text-right">
                  <div className="flex items-center sm:justify-end gap-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#b59c7b]">AUTENTIKASI BAYAR</p>
                    <div className="h-2 w-2 rounded-full bg-brand-gold" />
                  </div>
                  <div className="space-y-1.5 sm:pr-0 pl-4 sm:pl-0 pr-3 py-1">
                    <p className="text-sm font-black uppercase text-[#1f1a11] italic tracking-widest">
                      {order.payment_channel || (order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment')}
                    </p>
                    <p className={cn(
                      "font-black uppercase text-[10px] tracking-widest",
                      order.payment_status === 'paid' ? "text-emerald-600" : "text-amber-600"
                    )}>
                      {paymentLabels[order.payment_status]}
                    </p>
                  </div>
                </div>
              </div>

              {/* Simplified Menu List */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-[2px] bg-[#f4e7d6] flex-1" />
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#b59c7b]">PURCHASE ITEMS</p>
                  <div className="h-[2px] bg-[#f4e7d6] flex-1" />
                </div>
                <div className="space-y-3">
                  {order.order_items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between gap-6 py-2.5 px-3 rounded-2xl hover:bg-[#fdfaf5] transition-colors border border-transparent hover:border-[#eadfce]/30">
                      <div className="flex items-center gap-5 min-w-0">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-500" />
                          ) : (
                            <UtensilsCrossed size={18} className="text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black uppercase text-[#1f1a11] line-clamp-1 italic tracking-tight">{item.name}</p>
                          <p className="text-[10px] font-bold text-[#b59c7b] mt-0.5">{item.quantity} units • {formatCurrency(item.price)}</p>
                        </div>
                      </div>
                      <p className="text-sm font-black text-[#1f1a11] italic tracking-tight">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced Note Section */}
              {order.notes && (
                <div className="relative p-6 rounded-[2.5rem] bg-[#fdfaf5] border-2 border-dashed border-[#eadfce]/60 group">
                  <div className="absolute -top-3 left-8 bg-[#fdfaf5] px-3 text-[8px] font-black uppercase tracking-[0.3em] text-[#b59c7b] border border-[#eadfce]/60 rounded-full shadow-sm">
                    Customer Notes
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-white border border-[#eadfce]/40 flex items-center justify-center text-brand-gold shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
                      <div className="relative">
                        <Info size={18} />
                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-brand-gold rounded-full animate-ping" />
                      </div>
                    </div>
                    <div className="pt-1.5">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#b59c7b] mb-1">NOTES</p>
                      <p className="text-xs font-bold text-[#5c5244] italic leading-relaxed">
                        "{order.notes}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Premium Summary Section */}
              <div className="pt-6 space-y-4">
                <div className="px-4 space-y-2.5">
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between items-center text-[10px] font-bold text-[#b59c7b] uppercase tracking-[0.2em] opacity-60">
                      <span>Total Pesanan</span>
                      <span className="line-through">{formatCurrency(order.total_amount + Number(order.discount_amount))}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[10px] font-bold text-[#b59c7b] uppercase tracking-[0.2em]">
                    <span>Pajak (10%)</span>
                    <span>{formatCurrency(order.tax_amount || Math.round(order.total_amount * 0.1))}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between items-center text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">
                      <span className="flex items-center gap-2 font-black italic tracking-tighter lowercase">
                        <Tag size={12} strokeWidth={2.5} className="text-red-500/50" />
                        promo: {order.promo_code}
                      </span>
                      <span>-{formatCurrency(order.discount_amount)}</span>
                    </div>
                  )}
                </div>

                <div className="rounded-[2.5rem] bg-[#1f1a11] p-8 flex items-center justify-between text-white shadow-3xl shadow-[#1f1a11]/30 relative overflow-hidden group hover:scale-[1.01] transition-all duration-500">
                  {/* Decorative background element */}
                  <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                    <CheckCircle2 size={120} />
                  </div>

                  <div className="space-y-1 relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-1">FINAL SETTLEMENT</p>
                    <h4 className="text-4xl font-black text-brand-gold italic tracking-tighter leading-none sm:text-5xl">
                      {formatCurrency(order.total_amount)}
                    </h4>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-2 text-right relative z-10">
                    <div className="h-12 w-12 rounded-xl border-2 border-white/10 flex items-center justify-center text-brand-gold bg-white/5 shadow-inner">
                      <CheckCircle2 size={28} strokeWidth={2.5} />
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40 italic">Transaction Secured</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Receipt Footer Decorative */}
            <div className="h-4 bg-[#1f1a11] flex justify-center items-center gap-1 overflow-hidden opacity-20">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="h-1 w-1 bg-white rounded-full flex-shrink-0" />
              ))}
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#b59c7b] opacity-40">TakumaEat • Modern Receipt System v2.0</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
