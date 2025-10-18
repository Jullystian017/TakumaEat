"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AlertCircle, Bell, CheckCircle2, Megaphone, Receipt, Tag } from "lucide-react";

import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type NotificationCategory = "order" | "payment" | "promo" | "system";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  category: NotificationCategory;
  status: "unread" | "read";
  action?: {
    label: string;
    href: string;
  };
};

type FilterKey = "all" | NotificationCategory;

type FilterOption = {
  key: FilterKey;
  label: string;
};

const filters: FilterOption[] = [
  { key: "all", label: "Semua" },
  { key: "order", label: "Order" },
  { key: "payment", label: "Pembayaran" },
  { key: "promo", label: "Promo" },
  { key: "system", label: "Sistem" }
];

const categoryLabels: Record<NotificationCategory, string> = {
  order: "Order",
  payment: "Pembayaran",
  promo: "Promo",
  system: "Sistem"
};

const categoryIcons: Record<NotificationCategory, React.ComponentType<{ className?: string }>> = {
  order: Receipt,
  payment: CheckCircle2,
  promo: Tag,
  system: AlertCircle
};

const mockNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Pembayaran berhasil",
    description: "Pembayaran untuk pesanan #INV-120398 sudah diterima. Pesanan sedang kami proses.",
    createdAt: "2025-10-16T08:12:00.000Z",
    category: "payment",
    status: "unread",
    action: {
      label: "Lihat pesanan",
      href: "/orders"
    }
  },
  {
    id: "notif-2",
    title: "Pesanan siap diantar",
    description: "Kurir kami sedang menuju alamatmu. Pastikan nomor telepon aktif untuk konfirmasi.",
    createdAt: "2025-10-15T12:45:00.000Z",
    category: "order",
    status: "read",
    action: {
      label: "Track pesanan",
      href: "/orders"
    }
  },
  {
    id: "notif-3",
    title: "Promo eksklusif untuk kamu",
    description: "Gunakan kode TAKUMA15 untuk diskon 15% pada menu favoritmu hingga akhir pekan ini.",
    createdAt: "2025-10-14T15:30:00.000Z",
    category: "promo",
    status: "unread",
    action: {
      label: "Lihat promo",
      href: "/promo"
    }
  },
  {
    id: "notif-4",
    title: "Perubahan jadwal operasional",
    description: "Cabang Senopati buka hingga pukul 23.30 mulai akhir pekan ini. Nikmati waktu makan lebih panjang.",
    createdAt: "2025-10-12T09:20:00.000Z",
    category: "system",
    status: "read"
  }
];

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "long",
      timeStyle: "short"
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent("/notifications")}`);
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      return;
    }

    const loadNotifications = async () => {
      setLoading(true);
      setNotifications(mockNotifications);
      setLoading(false);
    };

    loadNotifications();
  }, [sessionStatus]);

  const unreadCount = useMemo(() => notifications.filter((item) => item.status === "unread").length, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") {
      return notifications;
    }
    return notifications.filter((item) => item.category === activeFilter);
  }, [notifications, activeFilter]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, status: "read" })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "unread" ? "read" : "unread"
            }
          : item
      )
    );
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#fdf9f1] pb-24 pt-32 text-[#1f1a11]">
        <section className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <header className="flex flex-col gap-6 border-b border-[#d0bfa6]/40 pb-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f4e7d6] px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8d5814]">
                  Notifikasi
                </span>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-[#1f1a11] sm:text-4xl">Tetap up to date</h1>
                  <Badge className="rounded-full border-none bg-black text-[11px] font-semibold uppercase tracking-[0.3em] text-white">
                    {unreadCount} baru
                  </Badge>
                </div>
                <p className="text-sm text-[#5c5244]">
                  Lihat status terbaru pesanan, pembayaran, dan promo yang kami siapkan untukmu.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:self-start md:self-auto">
                <div className="flex items-center gap-2 rounded-full border border-[#eadfce] bg-white px-4 py-2 text-xs text-[#7b5d2f]">
                  <Bell className="h-4 w-4 text-[#a0792c]" />
                  <span>{notifications.length} notifikasi</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                  className="w-full rounded-full border border-[#eadfce] bg-[#fdf6ec] px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#7b5d2f] disabled:opacity-60 sm:w-auto"
                >
                  Tandai sudah dibaca
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition-colors",
                    activeFilter === filter.key
                      ? "border-brand-gold bg-[#fae8c8] text-[#8d5814]"
                      : "border-[#eadfce] bg-[#fff6eb] text-[#7b5d2f] hover:border-brand-gold/60"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </header>

          <div className="mt-10 space-y-5">
            {loading && (
              <div className="rounded-3xl border border-[#eadfce] bg-white p-6 text-sm text-[#7b6a57] shadow-[0_28px_60px_rgba(183,150,111,0.18)]">
                Memuat notifikasi...
              </div>
            )}

            {!loading && filteredNotifications.length === 0 && (
              <div className="flex flex-col items-center gap-4 rounded-3xl border border-[#eadfce] bg-white p-10 text-center text-sm text-[#7b6a57] shadow-[0_28px_60px_rgba(183,150,111,0.18)]">
                <Bell className="h-10 w-10 text-[#d0bfa6]" />
                <p className="text-base font-semibold text-[#1f1a11]">Belum ada notifikasi</p>
                <p className="max-w-md text-sm text-[#7b6a57]">
                  Kami akan memberi tahu kamu ketika ada pembaruan penting seputar pesanan atau promo terbaru.
                </p>
                <Button
                  onClick={() => setActiveFilter("all")}
                  className="rounded-full bg-brand-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black shadow-[0_20px_42px_rgba(239,176,54,0.32)]"
                >
                  Tampilkan semua
                </Button>
              </div>
            )}

            {!loading && filteredNotifications.length > 0 && (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => {
                  const Icon = notification.category === "promo" ? Megaphone : categoryIcons[notification.category];
                  const isUnread = notification.status === "unread";

                  return (
                    <article
                      key={notification.id}
                      className={cn(
                        "flex flex-col gap-4 rounded-3xl border px-6 py-5 shadow-[0_22px_50px_rgba(183,150,111,0.16)] transition-transform sm:flex-row sm:items-center sm:justify-between",
                        isUnread ? "border-brand-gold/60 bg-white" : "border-[#eadfce] bg-[#fff9f1]"
                      )}
                    >
                      <div className="flex flex-1 items-start gap-4">
                        <div className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl border",
                          isUnread ? "border-brand-gold bg-[#fae8c8] text-[#8d5814]" : "border-[#eadfce] bg-white text-[#a0792c]"
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-semibold text-[#1f1a11]">{notification.title}</h2>
                            {isUnread && (
                              <Badge className="rounded-full border-none bg-brand-gold text-[10px] font-semibold uppercase tracking-[0.28em] text-black">
                                Baru
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-[#5c5244]">{notification.description}</p>
                          <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#9a8871]">
                            <Badge className="rounded-full border border-[#eadfce] bg-[#fff6eb] px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-[#7b5d2f]">
                              {categoryLabels[notification.category]}
                            </Badge>
                            <span>{formatDate(notification.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 sm:items-end sm:self-end">
                        {notification.action ? (
                          <Button
                            asChild
                            className="w-full rounded-full bg-brand-gold px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-black shadow-[0_18px_36px_rgba(239,176,54,0.3)] sm:w-auto"
                          >
                            <Link href={notification.action.href}>{notification.action.label}</Link>
                          </Button>
                        ) : (
                          <div className="hidden sm:block" />
                        )}
                        <Button
                          variant="ghost"
                          onClick={() => handleToggleRead(notification.id)}
                          className="w-full rounded-full border border-[#eadfce] bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#7b5d2f] hover:bg-[#fdf2df] sm:w-auto"
                        >
                          {isUnread ? "Tandai dibaca" : "Tandai belum dibaca"}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
