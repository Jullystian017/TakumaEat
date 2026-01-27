"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Search, ShoppingBag, Truck, ChevronRight, Clock } from "lucide-react";

import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  paid: "Pembayaran berhasil",
  failed: "Pembayaran gagal",
  cancelled: "Pembayaran dibatalkan",
  expired: "Kedaluwarsa",
  refunded: "Dana dikembalikan",
  partial_refund: "Pengembalian sebagian",
  cod_pending: "Menunggu pembayaran COD"
};

const tabs = [
  { key: "all", label: "Semua" },
  { key: "awaiting", label: "Menunggu" },
  { key: "inProgress", label: "Diproses" },
  { key: "completed", label: "Selesai" },
  { key: "cancelled", label: "Dibatalkan" }
] as const;

type TabKey = (typeof tabs)[number]["key"];

type OrderSummary = {
  id: string;
  status: string;
  payment_status: string;
  payment_method: "midtrans" | "cod";
  order_type: "delivery" | "takeaway";
  total_amount: number;
  created_at: string;
};

type OrdersResponse = {
  orders: OrderSummary[];
};

function mapTabToStatuses(tab: TabKey) {
  switch (tab) {
    case "awaiting":
      return ["pending_payment", "pending_review", "unpaid", "waiting_for_payment", "cod_pending"];
    case "inProgress":
      return ["processing", "preparing", "ready_for_pickup", "out_for_delivery"];
    case "completed":
      return ["completed"];
    case "cancelled":
      return ["cancelled", "refunded"];
    default:
      return [];
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(value);
}

function formatOrderDate(value: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "long",
      timeStyle: "short"
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
}

export default function OrdersPage() {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent("/orders")}`);
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/orders", { cache: "no-store" });
        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as { message?: string };
          throw new Error(body.message ?? "Gagal memuat pesanan");
        }
        const data = (await response.json()) as OrdersResponse;
        setOrders(data.orders);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    if (sessionStatus === "authenticated") {
      fetchOrders();
    }
  }, [sessionStatus]);

  const [visibleCount, setVisibleCount] = useState(6);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (activeTab !== "all") {
      const statuses = mapTabToStatuses(activeTab);
      result = orders.filter(
        (order) => statuses.includes(order.status) || statuses.includes(order.payment_status)
      );
    }
    return result;
  }, [orders, activeTab]);

  const groupedOrders = useMemo(() => {
    const groups: { title: string; orders: OrderSummary[] }[] = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const initialVisible = filteredOrders.slice(0, visibleCount);

    initialVisible.forEach((order) => {
      const orderDate = new Date(order.created_at);
      const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());

      let title = "Sebelumnya";
      if (orderDay.getTime() === today.getTime()) {
        title = "Hari Ini";
      } else if (orderDay.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
        title = "Minggu Ini";
      } else if (orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()) {
        title = "Bulan Ini";
      }

      const existingGroup = groups.find((g) => g.title === title);
      if (existingGroup) {
        existingGroup.orders.push(order);
      } else {
        groups.push({ title, orders: [order] });
      }
    });

    return groups;
  }, [filteredOrders, visibleCount]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f9f8fa] pb-24 pt-32 text-[#1f1a11]">
        <section className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <header className="space-y-4 border-b border-[#eadfce] pb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f4e7d6] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.32em] text-[#8d5814]">
              Pesanan Saya
            </span>
            <h1 className="text-4xl font-black tracking-tight text-[#1f1a11] sm:text-5xl">
              Riwayat Transaksi
            </h1>
            <p className="text-sm font-medium text-[#5c5244] opacity-70">
              Pantau status pesanan yang sedang berjalan, selesaikan pembayaran, dan lihat riwayat pesanan menu favoritmu.
            </p>
          </header>

          <div className="mt-8 flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setVisibleCount(6); // Reset pagination on tab change
                }}
                className={cn(
                  "whitespace-nowrap rounded-2xl border px-6 py-3 text-[10px] font-black uppercase tracking-[0.22em] transition-all",
                  activeTab === tab.key
                    ? "border-[#1f1a11] bg-[#1f1a11] text-brand-gold shadow-lg shadow-[#1f1a11]/10"
                    : "border-[#eadfce] bg-white text-[#7b5d2f] hover:border-brand-gold"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-gold border-t-transparent" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#b59c7b]">Sinkronisasi Pesanan...</p>
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center sm:p-12">
                <p className="text-sm font-bold text-red-600">{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-6 bg-red-600 text-white rounded-full">Coba Lagi</Button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center gap-6 rounded-[2.5rem] border border-[#eadfce] bg-white p-12 text-center shadow-xl shadow-[#b7966f]/10 outline-dashed outline-2 outline-offset-[-20px] outline-[#eadfce]">
                <div className="h-20 w-20 rounded-3xl bg-[#fdf8f0] flex items-center justify-center text-brand-gold">
                  <ShoppingBag size={40} strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-[#1f1a11]">Belum Ada Pesanan</h3>
                  <p className="max-w-md text-sm font-medium text-[#7b6a57] opacity-80 leading-relaxed">
                    Pesanan yang kamu buat akan muncul di sini. Ayo mulai belanja menu favoritmu!
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/menu")}
                  className="rounded-full bg-brand-gold px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-black shadow-lg shadow-brand-gold/20"
                >
                  Jelajahi Menu
                </Button>
              </div>
            ) : (
              <div className="space-y-12">
                {groupedOrders.map((group) => (
                  <div key={group.title} className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-1 rounded-full bg-brand-gold shadow-[0_0_10px_rgba(183,150,111,0.3)]" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.45em] text-[#1f1a11]/80">
                        {group.title}
                      </h3>
                    </div>
                    <div className="grid gap-6">
                      {group.orders.map((order) => (
                        <motion.article
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group relative overflow-hidden rounded-[2.5rem] border border-[#eadfce]/50 bg-white p-6 transition-all hover:border-brand-gold hover:shadow-2xl hover:shadow-[#b7966f]/10"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            {/* Left Side: ID & Info */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#b59c7b]">
                                  #{order.id.slice(0, 8).toUpperCase()}
                                </span>
                                <span className={cn(
                                  "rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest",
                                  order.status === 'completed' ? "bg-emerald-500/10 text-emerald-600" :
                                    order.status === 'cancelled' ? "bg-red-500/10 text-red-600" :
                                      "bg-brand-gold/10 text-brand-gold"
                                )}>
                                  {statusLabels[order.status]}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <h2 className="text-2xl font-black tracking-tight text-[#1f1a11]">
                                  Pesanan {order.order_type === 'delivery' ? 'Delivery' : 'Takeaway'}
                                </h2>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-[#b59c7b] uppercase tracking-widest">
                                  <Clock size={12} strokeWidth={2.5} />
                                  {formatOrderDate(order.created_at)}
                                </div>
                              </div>
                            </div>

                            {/* Right Side: Price & Payment Status */}
                            <div className="flex flex-col items-start gap-3 sm:items-end">
                              <div className="text-left sm:text-right">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#b59c7b]">TOTAL BAYAR</p>
                                <p className="text-3xl font-black tracking-tight text-[#1f1a11]">{formatCurrency(order.total_amount)}</p>
                              </div>
                              <div className="rounded-2xl bg-[#fdfaf5] border border-[#eadfce]/40 px-5 py-2">
                                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#8d5814]">
                                  {order.payment_status === 'paid' ? 'PEMBAYARAN BERHASIL' :
                                    order.payment_status === 'unpaid' ? 'MENUNGGU PEMBAYARAN' :
                                      paymentLabels[order.payment_status]?.toUpperCase() || order.payment_status.toUpperCase()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Footer: Action Link */}
                          <div className="mt-6 border-t border-[#eadfce]/30 pt-6">
                            <Link
                              href={`/orders/${order.id}`}
                              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em] text-[#b59c7b] transition-all hover:gap-4 hover:text-[#1f1a11]"
                            >
                              Lihat Detail Pesanan <ChevronRight size={14} className="text-brand-gold" />
                            </Link>
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  </div>
                ))}

                {filteredOrders.length > visibleCount && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => setVisibleCount(prev => prev + 6)}
                      className="group flex flex-col items-center gap-3 transition-all"
                    >
                      <div className="rounded-full border border-[#eadfce] bg-white px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.3em] text-[#7b5d2f] shadow-sm transition-all hover:border-brand-gold hover:bg-brand-gold hover:text-black">
                        Lihat Lebih Banyak
                      </div>
                      <div className="h-1 my-1 w-1 bg-brand-gold rounded-full animate-bounce" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
