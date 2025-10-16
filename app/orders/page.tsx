"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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

type UpdateOrderResponse = {
  order: OrderSummary;
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

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") {
      return orders;
    }
    const statuses = mapTabToStatuses(activeTab);
    return orders.filter(
      (order) => statuses.includes(order.status) || statuses.includes(order.payment_status)
    );
  }, [orders, activeTab]);

  const handleMockUpdate = async (orderId: string, payload: Partial<{ paymentStatus: string; status: string }>) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message ?? "Gagal memperbarui status pesanan");
      }

      const data = (await response.json()) as UpdateOrderResponse;
      setOrders((prev) => prev.map((order) => (order.id === data.order.id ? data.order : order)));
    } catch (updateError) {
      console.error(updateError);
      setError(updateError instanceof Error ? updateError.message : "Gagal memperbarui status pesanan");
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#fdf9f1] pb-24 pt-32 text-[#1f1a11]">
        <section className="mx-auto w-full max-w-5xl px-6">
          <header className="space-y-3 border-b border-[#d0bfa6]/40 pb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f4e7d6] px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8d5814]">
              Pesanan Saya
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-[#1f1a11] sm:text-4xl">
              Kelola pesananmu
            </h1>
            <p className="text-sm text-[#5c5244]">
              Pantau status pesanan yang sedang berjalan, selesaikan pembayaran Midtrans, dan lihat riwayat transaksi.
            </p>
          </header>

          <div className="mt-8 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition-colors",
                  activeTab === tab.key
                    ? "border-brand-gold bg-[#fae8c8] text-[#8d5814]"
                    : "border-[#eadfce] bg-[#fff6eb] text-[#7b5d2f] hover:border-brand-gold/60"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-10 space-y-6">
            {loading && (
              <div className="rounded-3xl border border-[#eadfce] bg-white p-6 text-sm text-[#7b6a57] shadow-[0_28px_60px_rgba(183,150,111,0.18)]">
                Memuat pesanan...
              </div>
            )}

            {!loading && error && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 shadow-[0_20px_45px_rgba(239,176,54,0.18)]">
                {error}
              </div>
            )}

            {!loading && !error && filteredOrders.length === 0 && (
              <div className="flex flex-col items-center gap-4 rounded-3xl border border-[#eadfce] bg-white p-10 text-center text-sm text-[#7b6a57] shadow-[0_28px_60px_rgba(183,150,111,0.18)]">
                <p className="text-base font-semibold text-[#1f1a11]">Belum ada pesanan</p>
                <p className="max-w-md text-sm text-[#7b6a57]">
                  Pesanan yang kamu buat akan muncul di sini. Mulai belanja menu favoritmu dan checkout untuk melihat pesanan aktif.
                </p>
                <Button
                  onClick={() => router.push("/menu")}
                  className="rounded-full bg-brand-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black shadow-[0_20px_42px_rgba(239,176,54,0.32)]"
                >
                  Jelajahi Menu
                </Button>
              </div>
            )}

            {!loading && !error && filteredOrders.length > 0 && (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-3xl border border-[#eadfce] bg-white p-6 shadow-[0_28px_60px_rgba(183,150,111,0.18)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b59c7b]">
                          Pesanan #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <h2 className="text-lg font-semibold text-[#1f1a11]">
                          {statusLabels[order.status] ?? order.status}
                        </h2>
                        <p className="text-xs text-[#7b6a57]">
                          Dibuat {formatOrderDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right text-sm text-[#5c5244]">
                        <p className="font-semibold text-[#1f1a11]">{formatCurrency(order.total_amount)}</p>
                        <p className="text-xs">
                          Pembayaran: {paymentLabels[order.payment_status] ?? order.payment_status}
                        </p>
                        <p className="text-xs">Metode: {order.payment_method.toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#f4e7d6] px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8d5814]">
                        {order.order_type === "delivery" ? "Delivery" : "Takeaway"}
                      </span>
                      {order.payment_method === "midtrans" && order.payment_status === "unpaid" && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#ffe1d9] px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#c2410c]">
                          Menunggu pembayaran
                        </span>
                      )}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8d5814] transition-colors hover:text-[#a1691a]"
                      >
                        Lihat detail pesanan →
                      </Link>
                      {order.payment_method === "midtrans" && order.payment_status === "unpaid" && (
                        <Button
                          onClick={() => router.push(`/orders/${order.id}`)}
                          className="rounded-full bg-brand-gold px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black shadow-[0_18px_36px_rgba(239,176,54,0.3)]"
                        >
                          Selesaikan pembayaran
                        </Button>
                      )}
                      {process.env.NODE_ENV !== "production" && order.payment_method === "midtrans" && order.payment_status === "unpaid" && (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="ghost"
                            className="rounded-full border border-[#eadfce] bg-[#fff6eb] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7b5d2f] hover:border-brand-gold/60"
                            onClick={() => handleMockUpdate(order.id, { paymentStatus: "paid", status: "processing" })}
                          >
                            Tandai dibayar (mock)
                          </Button>
                          <Button
                            variant="ghost"
                            className="rounded-full border border-[#eadfce] bg-[#fff6eb] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7b5d2f] hover:border-brand-gold/60"
                            onClick={() => handleMockUpdate(order.id, { paymentStatus: "failed", status: "cancelled" })}
                          >
                            Tandai gagal (mock)
                          </Button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
