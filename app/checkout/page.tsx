"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ClipboardList, Home, MapPin } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Footer } from "@/app/components/Footer";
import { Navbar } from "@/app/components/Navbar";
import { cn } from "@/lib/utils";
import { useCart } from "@/app/context/CartContext";

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: Record<string, unknown>) => void;
    };
  }
}

type OrderType = "delivery" | "takeaway";

type BranchRecord = {
  id: string;
  name: string;
  address: string;
  operation_hours: string;
};

type DeliveryFormState = {
  fullName: string;
  phone: string;
  addressLine: string;
  detail: string;
  scheduleType: "ASAP" | "SCHEDULED";
  scheduledAt: string;
  notes: string;
};

type TakeawayFormState = {
  branchId: string;
  branchName: string;
  pickupType: "NOW" | "SCHEDULED";
  pickupAt: string;
  notes: string;
  paymentMethod: "midtrans" | "cod";
};

type Step = "review" | "details" | "confirmation";

const defaultDelivery: DeliveryFormState = {
  fullName: "",
  phone: "",
  addressLine: "",
  detail: "",
  scheduleType: "ASAP",
  scheduledAt: "",
  notes: ""
};

const defaultTakeaway: TakeawayFormState = {
  branchId: "",
  branchName: "",
  pickupType: "NOW",
  pickupAt: "",
  notes: "",
  paymentMethod: "midtrans"
};

const staticBranches = [
  {
    id: "tokyo",
    name: "TakumaEat Tokyo",
    address: "Shibuya Crossing, Tokyo",
    operation: "10.00 - 22.00"
  },
  {
    id: "jakarta",
    name: "TakumaEat Jakarta",
    address: "Jl. Senopati No. 17, Kebayoran Baru",
    operation: "11.00 - 23.00"
  },
  {
    id: "bandung",
    name: "TakumaEat Bandung",
    address: "Jl. Riau No. 22, Bandung",
    operation: "10.00 - 21.00"
  }
];

type CreateOrderResponse = {
  orderId: string;
  payment: {
    method: "midtrans" | "cod";
    snapToken?: string | null;
  };
};

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams?.get("mode");
  const { data: session, status: sessionStatus } = useSession();
  const {
    cartItems,
    cartItemCount,
    cartSubtotal,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart
  } = useCart();

  const [step, setStep] = useState<Step>("review");
  const [orderType, setOrderType] = useState<OrderType>(() => (modeParam === "takeaway" ? "takeaway" : "delivery"));
  const [deliveryForm, setDeliveryForm] = useState<DeliveryFormState>(defaultDelivery);
  const [takeawayForm, setTakeawayForm] = useState<TakeawayFormState>(defaultTakeaway);
  const [snapReady, setSnapReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branchesFallback, setBranchesFallback] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [thankYouVariant, setThankYouVariant] = useState<'success' | 'pending' | 'cod' | 'error'>('success');
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const orderFinalizedRef = useRef(false);

  const storageKey = "takumaeat:checkout-state";

  useEffect(() => {
    const mode = modeParam === "takeaway" ? "takeaway" : "delivery";
    setOrderType(mode);
  }, [modeParam]);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent("/checkout")}`);
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    if (!orderFinalizedRef.current && step === "review" && cartItemCount === 0) {
      router.replace("/menu");
    }
  }, [cartItemCount, router, step]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.snap) {
      setSnapReady(true);
      return;
    }

    const snapUrl =
      process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL ?? "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";

    if (!clientKey) {
      setSnapReady(false);
      setErrorMessage("Client key Midtrans belum dikonfigurasi.");
      return;
    }

    const script = document.createElement("script");
    script.src = snapUrl;
    script.setAttribute("data-client-key", clientKey);
    script.onload = () => setSnapReady(true);
    script.onerror = () => setSnapReady(false);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const loadInitialState = () => {
      if (typeof window === "undefined") return;
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const parsed = JSON.parse(raw) as {
          orderType?: OrderType;
          delivery?: DeliveryFormState;
          takeaway?: TakeawayFormState;
        };
        if (!modeParam && parsed.orderType) {
          setOrderType(parsed.orderType);
        }
        if (parsed.delivery) {
          setDeliveryForm({ ...defaultDelivery, ...parsed.delivery });
        }
        if (parsed.takeaway) {
          setTakeawayForm({ ...defaultTakeaway, ...parsed.takeaway });
        }
      } catch (error) {
        console.warn("Failed to load checkout state", error);
      }
    };
    loadInitialState();
  }, [modeParam]);

  useEffect(() => {
    const persistState = () => {
      if (typeof window === "undefined") return;
      const payload = {
        orderType,
        delivery: deliveryForm,
        takeaway: takeawayForm
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    };
    persistState();
  }, [orderType, deliveryForm, takeawayForm]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setBranchesLoading(true);
        const response = await fetch("/api/branches");
        if (!response.ok) {
          throw new Error("Failed to fetch branches");
        }
        const data = (await response.json()) as { branches: BranchRecord[]; fallback?: boolean };
        setBranches(data.branches);
        setBranchesFallback(Boolean(data.fallback));
      } catch (error) {
        setBranchesFallback(true);
        setBranches([]);
      } finally {
        setBranchesLoading(false);
      }
    };
    if (orderType === "takeaway") {
      fetchBranches();
    }
  }, [orderType]);

  const validateDeliveryForm = () => {
    if (!deliveryForm.fullName.trim() || !deliveryForm.phone.trim() || !deliveryForm.addressLine.trim()) {
      setErrorMessage("Lengkapi nama, nomor telepon, dan alamat pengantaran.");
      return false;
    }

    if (!/^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(deliveryForm.phone.trim())) {
      setErrorMessage("Format nomor telepon tidak valid. Gunakan nomor ponsel Indonesia.");
      return false;
    }

    if (deliveryForm.scheduleType === "SCHEDULED" && !deliveryForm.scheduledAt) {
      setErrorMessage("Pilih waktu pengantaran untuk jadwal terencana.");
      return false;
    }

    if (deliveryForm.scheduleType === "SCHEDULED" && deliveryForm.scheduledAt) {
      const scheduleDate = new Date(deliveryForm.scheduledAt);
      if (Number.isNaN(scheduleDate.getTime()) || scheduleDate.getTime() < Date.now()) {
        setErrorMessage("Waktu pengantaran harus lebih dari waktu sekarang.");
        return false;
      }
    }

    return true;
  };

  const validateTakeawayForm = () => {
    if (!takeawayForm.branchId) {
      setErrorMessage("Pilih cabang pengambilan pesanan.");
      return false;
    }

    if (takeawayForm.pickupType === "SCHEDULED" && !takeawayForm.pickupAt) {
      setErrorMessage("Pilih waktu pengambilan untuk jadwal terencana.");
      return false;
    }

    if (takeawayForm.pickupType === "SCHEDULED" && takeawayForm.pickupAt) {
      const pickupDate = new Date(takeawayForm.pickupAt);
      if (Number.isNaN(pickupDate.getTime()) || pickupDate.getTime() < Date.now()) {
        setErrorMessage("Waktu pengambilan harus lebih dari waktu sekarang.");
        return false;
      }
    }

    return true;
  };

  const overview = useMemo(() => {
    const deliveryFee = orderType === "delivery" ? 15000 : 0;
    const codFee = orderType === "takeaway" && takeawayForm.paymentMethod === "cod" ? 0 : 0;
    const total = cartSubtotal + deliveryFee + codFee;

    return {
      deliveryFee,
      codFee,
      total
    };
  }, [orderType, cartSubtotal, takeawayForm.paymentMethod]);

  const proceedToDetails = () => {
    if (step !== "review") return;
    setErrorMessage(null);
    setStep("details");
  };

  const backToReview = () => {
    if (step === "details") {
      setErrorMessage(null);
      setStep("review");
    }
  };

  const handlePlaceOrder = async () => {
    if (step !== "details" || isSubmitting) {
      return;
    }
    setErrorMessage(null);

    if (orderType === "delivery") {
      if (!validateDeliveryForm()) {
        return;
      }
    } else {
      if (!validateTakeawayForm()) {
        return;
      }
    }

    await triggerCheckout();
  };

  const openThankYouModal = (orderId: string, variant: 'success' | 'pending' | 'cod' | 'error') => {
    setCreatedOrderId(orderId);
    setThankYouVariant(variant);
    setShowThankYouModal(true);
  };

  const modalContent = useMemo(() => {
    switch (thankYouVariant) {
      case 'success':
        return {
          title: 'Pembayaran berhasil',
          description: 'Terima kasih! Pesananmu sudah kami terima dan sedang diproses.'
        };
      case 'pending':
        return {
          title: 'Menunggu pembayaran',
          description: 'Selesaikan pembayaran melalui Midtrans atau pantau statusnya di halaman detail pesanan.'
        };
      case 'cod':
        return {
          title: 'Pesanan berhasil dibuat',
          description: 'Silakan lakukan pembayaran saat pengambilan pesanan di cabang yang dipilih.'
        };
      case 'error':
        return {
          title: 'Transaksi belum selesai',
          description: 'Transaksi Midtrans dibatalkan. Kamu tetap bisa melanjutkan pembayaran dari halaman pesanan.'
        };
      default:
        return {
          title: 'Pesanan dibuat',
          description: 'Lihat detail pesanan untuk informasi lebih lanjut.'
        };
    }
  }, [thankYouVariant]);

  const handleViewOrder = () => {
    if (!createdOrderId) {
      return;
    }
    setShowThankYouModal(false);
    router.push(`/orders/${createdOrderId}`);
  };

  const handleCloseModal = () => {
    setShowThankYouModal(false);
    router.push('/');
  };

  const triggerCheckout = async () => {
    if (isSubmitting) {
      return;
    }

    const paymentMethod = orderType === "delivery" ? "midtrans" : takeawayForm.paymentMethod;

    if (paymentMethod === "midtrans" && !snapReady) {
      setErrorMessage("Midtrans belum siap. Muat ulang halaman atau coba kembali beberapa saat lagi.");
      return;
    }

    const cartPayload = cartItems.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      note: item.note || ""
    }));

    const payload = {
      orderType,
      paymentMethod,
      cartItems: cartPayload,
      delivery:
        orderType === "delivery"
          ? {
              ...deliveryForm
            }
          : undefined,
      takeaway:
        orderType === "takeaway"
          ? {
              ...takeawayForm
            }
          : undefined
    };

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({}))) as { message?: string };
        setErrorMessage(errorBody.message ?? "Gagal membuat pesanan. Coba lagi dalam beberapa saat.");
        return;
      }

      const data = (await response.json()) as CreateOrderResponse;
      setStep("confirmation");

      if (typeof window !== "undefined") {
        localStorage.removeItem(storageKey);
      }

      const finalizeOrder = (variant: 'success' | 'pending' | 'cod' | 'error') => {
        orderFinalizedRef.current = true;
        clearCart();
        openThankYouModal(data.orderId, variant);
      };

      if (
        data.payment.method === "midtrans" &&
        data.payment.snapToken &&
        data.payment.snapToken !== "pending-integration" &&
        typeof window !== "undefined" &&
        window.snap
      ) {
        let hasOpenedModal = false;

        const showModal = (variant: 'success' | 'pending' | 'cod' | 'error') => {
          hasOpenedModal = true;
          finalizeOrder(variant);
        };

        window.snap.pay(data.payment.snapToken, {
          onSuccess: () => showModal("success"),
          onPending: () => showModal("pending"),
          onError: () => {
            setErrorMessage("Transaksi Midtrans dibatalkan. Cek riwayat order untuk melanjutkan pembayaran.");
            showModal("error");
          },
          onClose: () => {
            if (!hasOpenedModal) {
              showModal("pending");
            }
          }
        });
        return;
      }

      finalizeOrder(data.payment.method === "midtrans" ? "pending" : "cod");
    } catch (error) {
      setErrorMessage("Terjadi kesalahan tidak terduga. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepper = () => {
    const steps: { key: Step; label: string }[] = [
      { key: "review", label: "Review" },
      { key: "details", label: "Detail Pesanan" },
      { key: "confirmation", label: "Konfirmasi" }
    ];

    return (
      <ol className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#9a8871]">
        {steps.map((stepItem, index) => {
          const isActive = step === stepItem.key;
          const isCompleted = steps.findIndex((s) => s.key === step) > index;

          return (
            <li key={stepItem.key} className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs",
                  isActive && "border-brand-gold bg-[#fae8c8] text-[#8d5814]",
                  isCompleted && "border-brand-gold bg-brand-gold text-black",
                  !isActive && !isCompleted && "border-[#e8dcc7] bg-white text-[#9a8871]"
                )}
              >
                {index + 1}
              </span>
              <span className={cn(isActive ? "text-[#8d5814]" : "text-[#9a8871]")}>{stepItem.label}</span>
            </li>
          );
        })}
      </ol>
    );
  };

  const currency = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  });

  const renderCartReview = () => (
    <section className="rounded-3xl border border-[#eadfce] bg-white p-6 shadow-[0_28px_60px_rgba(183,150,111,0.18)]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b59c7b]">Ringkasan Keranjang</p>
          <h2 className="mt-1 text-lg font-semibold text-[#1f1a11]">{cartItemCount} item dalam pesanan</h2>
        </div>
        <Button
          variant="ghost"
          className="rounded-full border border-[#eadfce] bg-[#fdf6ec] px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#7b5d2f] hover:bg-[#f7ebdb]"
          onClick={() => router.push("/menu")}
        >
          Tambah Menu
        </Button>
      </header>

      <div className="mt-6 space-y-4">
        {cartItems.map((item) => (
          <article
            key={item.name}
            className="flex items-center gap-4 rounded-2xl border border-[#eadfce] bg-[#fff9f1] p-4"
          >
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-[#eadfce] bg-[#f4e7d6]">
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#8d5814]">
                  TakumaEat
                </div>
              )}
              <span className="absolute -top-2 -right-2 inline-flex h-7 min-w-[2.5rem] items-center justify-center rounded-full bg-brand-gold px-2 text-xs font-semibold text-black shadow-[0_10px_24px_rgba(239,176,54,0.4)]">
                {item.quantity}x
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#1f1a11]">{item.name}</p>
                  <p className="text-xs text-[#847766]">{item.note || "Tanpa catatan"}</p>
                </div>
                <div className="text-right text-sm font-semibold text-[#1f1a11]">
                  <p>{currency.format(item.price)}</p>
                  <p className="text-xs text-[#7b6a57]">Subtotal {currency.format(item.price * item.quantity)}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-3 rounded-full border border-[#eadfce] bg-white px-2 py-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => decrementItem(item.name)}
                    className="h-7 w-7 rounded-full border border-transparent text-[#7b5d2f] hover:bg-[#f4e7d6]"
                  >
                    −
                  </Button>
                  <span className="w-8 text-center text-sm font-semibold text-[#1f1a11]">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => incrementItem(item.name)}
                    className="h-7 w-7 rounded-full border border-transparent text-[#7b5d2f] hover:bg-[#f4e7d6]"
                  >
                    +
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full border border-[#eadfce] text-[#a0792c] hover:bg-[#fdf2df]"
                  onClick={() => removeItem(item.name)}
                >
                  ×
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  const renderDeliveryForm = () => (
    <section className="rounded-3xl border border-[#eadfce] bg-white p-6 shadow-[0_28px_60px_rgba(183,150,111,0.18)]">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b59c7b]">Detail Pengantaran</p>
        <h2 className="text-lg font-semibold text-[#1f1a11]">Masukkan alamat dan jadwal pengantaran</h2>
      </header>
      <div className="mt-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a8871]">Nama penerima</span>
            <input
              type="text"
              className="rounded-2xl border border-[#eadfce] bg-[#fff9f1] px-4 py-3 text-sm text-[#1f1a11] focus:border-brand-gold focus:outline-none"
              value={deliveryForm.fullName}
              onChange={(event) => setDeliveryForm((prev) => ({ ...prev, fullName: event.target.value }))}
              placeholder="Nama lengkap penerima"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a8871]">Nomor telepon</span>
            <input
              type="tel"
              className="rounded-2xl border border-[#eadfce] bg-[#fff9f1] px-4 py-3 text-sm text-[#1f1a11] focus:border-brand-gold focus:outline-none"
              value={deliveryForm.phone}
              onChange={(event) => setDeliveryForm((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="08XXXXXXXXXX"
            />
          </label>
        </div>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a8871]">Alamat lengkap</span>
          <textarea
            className="rounded-2xl border border-[#eadfce] bg-[#fff9f1] px-4 py-3 text-sm text-[#1f1a11] focus:border-brand-gold focus:outline-none"
            rows={3}
            value={deliveryForm.addressLine}
            onChange={(event) => setDeliveryForm((prev) => ({ ...prev, addressLine: event.target.value }))}
            placeholder="Masukkan alamat tujuan pengantaran"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a8871]">Detail lokasi (opsional)</span>
          <input
            type="text"
            className="rounded-2xl border border-[#eadfce] bg-[#fff9f1] px-4 py-3 text-sm text-[#1f1a11] focus:border-brand-gold focus:outline-none"
            value={deliveryForm.detail}
            onChange={(event) => setDeliveryForm((prev) => ({ ...prev, detail: event.target.value }))}
            placeholder="Blok / patokan / instruksi khusus"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a8871]">Jadwal pengantaran</span>
            <div className="flex gap-3">
              {[
                { key: "ASAP", label: "Antar segera" },
                { key: "SCHEDULED", label: "Jadwalkan" }
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setDeliveryForm((prev) => ({ ...prev, scheduleType: option.key as DeliveryFormState["scheduleType"] }))}
                  className={cn(
                    "flex-1 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition-all",
                    deliveryForm.scheduleType === option.key
                      ? "border-brand-gold bg-[#fae8c8] text-[#8d5814]"
                      : "border-[#eadfce] bg-[#fdf6ec] text-[#7b5d2f]"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          {deliveryForm.scheduleType === "SCHEDULED" && (
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a8871]">Pilih waktu</span>
              <input
                type="datetime-local"
                className="rounded-2xl border border-[#eadfce] bg-[#fff9f1] px-4 py-3 text-sm text-[#1f1a11] focus:border-brand-gold focus:outline-none"
                value={deliveryForm.scheduledAt}
                onChange={(event) => setDeliveryForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
              />
            </label>
          )}
        </div>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a8871]">Catatan untuk kurir</span>
          <textarea
            className="rounded-2xl border border-[#eadfce] bg-[#fff9f1] px-4 py-3 text-sm text-[#1f1a11] focus:border-brand-gold focus:outline-none"
            rows={2}
            value={deliveryForm.notes}
            onChange={(event) => setDeliveryForm((prev) => ({ ...prev, notes: event.target.value }))}
            placeholder="Contoh: Tolong hubungi saat sampai di lobby"
          />
        </label>
        <div className="rounded-2xl border border-brand-gold/40 bg-[#fff0d8] p-4 text-xs text-[#8d5814]">
          <p className="font-semibold uppercase tracking-[0.26em]">Peta lokasi</p>
          <p className="mt-2 text-[11px] text-[#b9893f]">
            Komponen peta interaktif akan ditempatkan di sini (mis. Mapbox / Google Maps). User dapat drop pin dan koordinat akan tersimpan di order.
          </p>
        </div>
      </div>
    </section>
  );

  const renderTakeawayForm = () => (
    <section className="rounded-3xl border border-[#eadfce] bg-white p-6 shadow-[0_28px_60px_rgba(183,150,111,0.18)]">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b59c7b]">Detail Pengambilan</p>
        <h2 className="text-lg font-semibold text-[#1f1a11]">Pilih cabang dan waktu pengambilan</h2>
      </header>
      <div className="mt-6 space-y-5">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a8871]">Cabang</span>
          <div className="space-y-6">
            {branchesLoading && (
              <div className="rounded-2xl border border-[#eadfce] bg-[#fff9f1] p-4 text-sm text-[#7b5d2f]">
                Memuat daftar cabang...
              </div>
            )}
            {!branchesLoading && branches.length === 0 && (
              <div className="rounded-2xl border border-[#eadfce] bg-[#fff9f1] p-4 text-sm text-[#7b5d2f]">
                Cabang belum tersedia. {branchesFallback ? "Gunakan data default atau hubungi admin." : "Silakan coba lagi nanti."}
              </div>
            )}
            {branches.map((branch) => {
              const isSelected = takeawayForm.branchId === branch.id;
              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => setTakeawayForm((prev) => ({
                    ...prev,
                    branchId: branch.id,
                    branchName: branch.name
                  }))}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-all",
                    isSelected
                      ? "border-brand-gold bg-[#fae8c8] text-[#8d5814]"
                      : "border-[#eadfce] bg-[#fff9f1] text-[#7b5d2f]"
                  )}
                >
                  <div>
                    <p className="text-sm font-semibold text-[#1f1a11]">{branch.name}</p>
                    <p className="text-[11px] text-[#847766]">{branch.address}</p>
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.26em] text-[#b59c7b]">{branch.operation_hours}</p>
                </button>
              );
            })}
          </div>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a8871]">Waktu ambil</span>
            <div className="flex gap-3">
              {[
                { key: "NOW", label: "Segera" },
                { key: "SCHEDULED", label: "Jadwalkan" }
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setTakeawayForm((prev) => ({ ...prev, pickupType: option.key as TakeawayFormState["pickupType"] }))}
                  className={cn(
                    "flex-1 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition-all",
                    takeawayForm.pickupType === option.key
                      ? "border-brand-gold bg-[#fae8c8] text-[#8d5814]"
                      : "border-[#eadfce] bg-[#fdf6ec] text-[#7b5d2f]"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          {takeawayForm.pickupType === "SCHEDULED" && (
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a8871]">Pilih waktu</span>
              <input
                type="datetime-local"
                className="rounded-2xl border border-[#eadfce] bg-[#fff9f1] px-4 py-3 text-sm text-[#1f1a11] focus:border-brand-gold focus:outline-none"
                value={takeawayForm.pickupAt}
                onChange={(event) => setTakeawayForm((prev) => ({ ...prev, pickupAt: event.target.value }))}
              />
            </label>
          )}
        </div>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a8871]">Catatan</span>
          <textarea
            className="rounded-2xl border border-[#eadfce] bg-[#fff9f1] px-4 py-3 text-sm text-[#1f1a11] focus:border-brand-gold focus:outline-none"
            rows={2}
            value={takeawayForm.notes}
            onChange={(event) => setTakeawayForm((prev) => ({ ...prev, notes: event.target.value }))}
            placeholder="Contoh: Mohon siapkan tanpa saus"
          />
        </label>
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a8871]">Metode pembayaran</span>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { key: "midtrans", label: "Midtrans", description: "Bayar non-tunai (transfer / e-wallet)" },
              { key: "cod", label: "Bayar di tempat", description: "Bayar saat mengambil pesanan" }
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setTakeawayForm((prev) => ({ ...prev, paymentMethod: option.key as TakeawayFormState["paymentMethod"] }))}
                className={cn(
                  "rounded-2xl border px-4 py-4 text-left text-sm transition-all",
                  takeawayForm.paymentMethod === option.key
                    ? "border-brand-gold bg-[#fae8c8] text-[#8d5814]"
                    : "border-[#eadfce] bg-[#fff9f1] text-[#7b5d2f]"
                )}
              >
                <p className="font-semibold uppercase tracking-[0.22em] text-[#1f1a11]">{option.label}</p>
                <p className="mt-2 text-[11px] text-[#847766]">{option.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  const renderSummary = () => (
    <aside className="flex w-full flex-col gap-5 rounded-3xl border border-[#eadfce] bg-white p-6 shadow-[0_28px_60px_rgba(183,150,111,0.18)] lg:sticky lg:top-28 lg:self-start">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b59c7b]">Ringkasan pembayaran</p>
        <h2 className="text-lg font-semibold text-[#1f1a11]">Total tagihan</h2>
      </header>
      <dl className="space-y-3 text-sm text-[#5c5244]">
        <div className="flex items-center justify-between">
          <dt>Subtotal</dt>
          <dd className="font-semibold text-[#1f1a11]">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(cartSubtotal)}</dd>
        </div>
        {overview.deliveryFee > 0 && (
          <div className="flex items-center justify-between">
            <dt>Biaya pengantaran</dt>
            <dd className="font-semibold text-[#1f1a11]">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(overview.deliveryFee)}</dd>
          </div>
        )}
        {overview.codFee > 0 && (
          <div className="flex items-center justify-between">
            <dt>Biaya COD</dt>
            <dd className="font-semibold text-[#1f1a11]">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(overview.codFee)}</dd>
          </div>
        )}
      </dl>
      <div className="rounded-2xl border border-brand-gold/40 bg-[#fff0d8] p-4">
        <div className="flex items-center justify-between text-sm font-semibold text-[#8d5814]">
          <span>Total dibayar</span>
          <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(overview.total)}</span>
        </div>
      </div>
      <div className="space-y-3">
        {step === "details" && (
          <Button
            variant="ghost"
            onClick={backToReview}
            className="w-full rounded-full border border-[#eadfce] bg-[#fdf6ec] py-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#7b5d2f] hover:bg-[#f7ebdb]"
          >
            Kembali
          </Button>
        )}
        {step === "review" && (
          <Button
            onClick={proceedToDetails}
            className="w-full rounded-full bg-brand-gold py-3 text-xs font-semibold uppercase tracking_[0.24em] text-black shadow_[0_24px_56px_rgba(239,176,54,0.42)] hover:shadow_[0_30px_70px_rgba(239,176,54,0.55)]"
          >
            Lanjutkan ke detail
          </Button>
        )}
        {step === "details" && (
          <Button
            onClick={handlePlaceOrder}
            disabled={
              (orderType === "delivery" && !snapReady) ||
              (orderType === "takeaway" && takeawayForm.paymentMethod === "midtrans" && !snapReady) ||
              isSubmitting
            }
            className="w-full rounded-full bg-brand-gold py-3 text-xs font-semibold uppercase tracking_[0.24em] text-black shadow_[0_24px_56px_rgba(239,176,54,0.32)] hover:shadow_[0_30px_70px_rgba(239,176,54,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Memproses..." : "Place Order"}
          </Button>
        )}
        {step === "confirmation" && (
          <Button
            disabled
            className="w-full rounded-full bg-brand-gold py-3 text-xs font-semibold uppercase tracking_[0.24em] text-black opacity-70"
          >
            Memproses pesanan...
          </Button>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-2xl border border-[#eadfce] bg-[#fff9f1] px-3 py-2 text-[12px] text-[#7b6a57]">
          <Home className="h-4 w-4 text-[#a0792c]" />
          <span>Operasional 10.00 - 22.00 WIB</span>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-[#eadfce] bg-[#fff9f1] px-3 py-2 text-[12px] text-[#7b6a57]">
          <MapPin className="h-4 w-4 text-[#a0792c]" />
          <span>Jangkauan delivery 15KM</span>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-[#eadfce] bg-[#fff9f1] px-3 py-2 text-[12px] text-[#7b6a57] sm:col-span-2">
          <ClipboardList className="h-4 w-4 text-[#a0792c]" />
          <span>Invoice & status pesanan siap dipantau di halaman ini.</span>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pb-20 pt-24 text-[#1f1a11]">
        <section className="mx-auto w-full max-w-6xl px-6">
          <header className="flex flex-col gap-6 border-b border-[#d0bfa6]/40 pb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full border border-[#d0bfa6]/60 text-[#1f1a11] hover:bg-[#f4e7d6]"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f4e7d6] px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8d5814]">
                Checkout
              </span>
              <h1 className="text-3xl font-semibold tracking-tight text-[#1f1a11] sm:text-4xl">Selesaikan pesanan TakumaEat-mu</h1>
              <p className="text-sm text-[#5c5244]">
                Pilih metode pengantaran atau takeaway, lalu lanjutkan ke pembayaran. Kami akan memproses pesananmu dengan standar premium.
              </p>
            </div>
          </div>
          {renderStepper()}
        </header>

        {errorMessage && (
          <div className="mt-6 rounded-3xl border border-red-300/60 bg-red-100 p-5 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr,1fr] lg:items-start">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#eadfce] bg-white px-6 py-4 shadow-[0_18px_40px_rgba(183,150,111,0.16)]">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b59c7b]">Metode pemenuhan</p>
                <p className="text-base font-semibold text-[#1f1a11]">
                  {orderType === "delivery" ? "Delivery" : "Takeaway"}
                </p>
              </div>
              <Button
                variant="ghost"
                className="rounded-full border border-[#eadfce] bg-[#fdf6ec] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#7b5d2f] hover:bg-[#f7ebdb]"
                onClick={() => router.push("/checkout/start")}
              >
                Ubah pilihan
              </Button>
            </div>

            {step === "review" && renderCartReview()}

            {step !== "review" && (
              <div className="space-y-8">
                {orderType === "delivery" ? renderDeliveryForm() : renderTakeawayForm()}
              </div>
            )}
          </div>

          {renderSummary()}
        </div>
        </section>
    </main>

    {showThankYouModal && createdOrderId && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-[32px] border border-white/20 bg-white/95 p-0 shadow-[0_40px_120px_rgba(15,23,42,0.28)] backdrop-blur">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#fce3c7] via-[#fef3d4] to-[#f8dfc8] opacity-90" />
            <div className="relative flex flex-col items-center gap-4 px-10 pb-10 pt-12 text-center text-[#1f1a11]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-[0_20px_40px_rgba(183,150,111,0.35)]">
                <svg viewBox="0 0 64 64" className="h-8 w-8 text-[#c7812e]" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 32.5l10 9.5 22-20" />
                </svg>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#9c7440]">Terima kasih</p>
                <h2 className="text-3xl font-semibold leading-tight text-[#1f1a11]">{modalContent.title}</h2>
                <p className="text-sm text-[#5c5244]">{modalContent.description}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-white/40 bg-white/96 px-8 py-6 text-left">
            <div className="flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-[#fff7eb] px-4 py-3 text-sm text-[#7b5d2f]">
              <ClipboardList className="h-4 w-4 text-[#b8792c]" />
              <span>Pesanan #{createdOrderId.slice(0, 8).toUpperCase()} sudah tercatat. Pantau statusnya dari halaman pesanan.</span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                className="flex-1 rounded-full border border-[#eadfce] bg-white px-5 py-3 text-sm font-semibold text-[#7b5d2f] hover:bg-[#f4e7d6] sm:flex-none sm:px-6"
                onClick={handleCloseModal}
              >
                Ke Beranda
              </Button>
              <Button
                className="flex-1 rounded-full bg-[#c7812e] px-6 py-3 text-sm font-semibold text-white shadow-[0_22px_45px_rgba(199,129,46,0.42)] transition-transform hover:-translate-y-0.5 hover:bg-[#d8913f] sm:flex-none"
                onClick={handleViewOrder}
              >
                Lihat detail pesanan
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}
    <Footer />
  </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CheckoutPageContent />
    </Suspense>
  );
}
