"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ClipboardList, Home, MapPin, Tag, Ticket, Percent, ExternalLink, Info, Loader2, Clock, Store, ShoppingCart } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Footer } from "@/app/components/Footer";
import { Navbar } from "@/app/components/Navbar";
import { cn } from "@/lib/utils";
import { useCart } from "@/app/context/CartContext";
import { AddressSelector } from "@/app/components/checkout/AddressSelector";

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
  map_url?: string;
};

type DeliveryFormState = {
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
    clearCart,
    isLoaded
  } = useCart();

  const [step, setStep] = useState<Step>("review");
  const [orderType, setOrderType] = useState<OrderType>(() => (modeParam === "takeaway" ? "takeaway" : "delivery"));
  const [deliveryForm, setDeliveryForm] = useState<DeliveryFormState>(defaultDelivery);
  const [takeawayForm, setTakeawayForm] = useState<TakeawayFormState>(defaultTakeaway);
  const [snapReady, setSnapReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Branches
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchesFallback, setBranchesFallback] = useState(false);

  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);

  // Promo
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [thankYouVariant, setThankYouVariant] = useState<'success' | 'pending' | 'cod' | 'error'>('success');
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const orderFinalizedRef = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);

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
    if (isLoaded && !orderFinalizedRef.current && step === "review" && cartItemCount === 0) {
      router.replace("/menu");
    }
  }, [cartItemCount, router, step, isLoaded]);

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
          step?: Step;
          orderType?: OrderType;
          delivery?: DeliveryFormState;
          takeaway?: TakeawayFormState;
        };
        if (parsed.step) {
          setStep(parsed.step);
        }
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
      } finally {
        setIsHydrated(true);
      }
    };
    loadInitialState();
  }, [modeParam]);

  useEffect(() => {
    if (!isHydrated) return;
    const persistState = () => {
      if (typeof window === "undefined") return;
      const payload = {
        step,
        orderType,
        delivery: deliveryForm,
        takeaway: takeawayForm
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    };
    persistState();
  }, [step, orderType, deliveryForm, takeawayForm, isHydrated]);

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

  // Reset promo on cart change or switch mode
  useEffect(() => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoMessage(null);
  }, [cartSubtotal]); // If total changes, we should re-validate if we want strictness, or just reset. Resetting is safer.

  const validateDeliveryForm = () => {
    if (!selectedAddressId) {
      setErrorMessage("Pilih atau tambah alamat pengantaran.");
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

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsCheckingPromo(true);
    setPromoMessage(null);
    setAppliedPromo(null);

    try {
      const res = await fetch('/api/promos/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, cartTotal: cartSubtotal })
      });
      const data = await res.json();

      if (data.valid) {
        setAppliedPromo({ code: data.promoCode, discount: data.discountAmount });
        setPromoMessage({ text: data.message, type: 'success' });
      } else {
        setPromoMessage({ text: data.message, type: 'error' });
      }
    } catch (error) {
      setPromoMessage({ text: 'Gagal mengecek promo', type: 'error' });
    } finally {
      setIsCheckingPromo(false);
    }
  };

  const overview = useMemo(() => {
    const deliveryFee = orderType === "delivery" ? 15000 : 0;
    const codFee = orderType === "takeaway" && takeawayForm.paymentMethod === "cod" ? 0 : 0;
    const discount = appliedPromo ? appliedPromo.discount : 0;
    const total = Math.max(0, cartSubtotal - discount + deliveryFee + codFee);

    return {
      deliveryFee,
      codFee,
      discount,
      total
    };
  }, [orderType, cartSubtotal, takeawayForm.paymentMethod, appliedPromo]);

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
      promoCode: appliedPromo?.code,
      delivery:
        orderType === "delivery"
          ? {
            ...deliveryForm,
            addressId: selectedAddressId
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
                  <p className="text-xs text--[#847766]">{item.note || "Tanpa catatan"}</p>
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
      <header className="space-y-1 mb-8">
        <div className="flex items-center gap-2 text-[#b59c7b]">
          <p className="text-xs font-semibold uppercase tracking-[0.32em]">Detail Pengantaran</p>
        </div>
        <h2 className="text-lg font-semibold text-[#1f1a11]">Pilih alamat dan jadwal pengantaran</h2>
      </header>

      <div className="mb-10">
        <AddressSelector
          selectedAddressId={selectedAddressId}
          onSelect={(address) => setSelectedAddressId(address.id)}
        />
      </div>

      <div className="space-y-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#9a8871]">
              <Clock size={12} className="text-[#8d5814]" />
              Jadwal pengantaran
            </span>
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
                    "flex-1 h-11 rounded-full border px-4 text-[10px] font-extrabold uppercase tracking-[0.22em] transition-all",
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
            <label className="flex flex-col gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#9a8871]">Pilih waktu</span>
              <input
                type="datetime-local"
                className="h-11 rounded-full border border-[#eadfce] bg-[#fdf6ec] px-5 text-xs text-[#1f1a11] focus:border-brand-gold focus:outline-none"
                value={deliveryForm.scheduledAt}
                onChange={(event) => setDeliveryForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
              />
            </label>
          )}
        </div>
        <label className="flex flex-col gap-3">
          <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#9a8871]">
            <ClipboardList size={12} className="text-[#8d5814]" />
            Catatan untuk kurir
          </span>
          <textarea
            className="rounded-2xl border border-[#eadfce] bg-[#fff9f1] px-4 py-3 text-sm text-[#1f1a11] focus:border-brand-gold focus:outline-none resize-none"
            rows={2}
            value={deliveryForm.notes}
            onChange={(event) => setDeliveryForm((prev) => ({ ...prev, notes: event.target.value }))}
            placeholder="Contoh: Tolong hubungi saat sampai di lobby"
          />
        </label>
      </div>
    </section>
  );

  const renderTakeawayForm = () => (
    <section className="rounded-3xl border border-[#eadfce] bg-white p-6 shadow-[0_28px_60px_rgba(183,150,111,0.18)]">
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-[#b59c7b]">
          <p className="text-xs font-semibold uppercase tracking-[0.32em]">Detail Pengambilan</p>
        </div>
        <h2 className="text-lg font-semibold text-[#1f1a11]">Pilih cabang dan waktu pengambilan</h2>
      </header>
      <div className="mt-6 space-y-5">
        <label className="flex flex-col gap-2">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#9a8871]">
            <Home size={14} className="text-[#8d5814]" />
            Cabang
          </span>
          <div className="space-y-3">
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
            <div className="grid gap-3 sm:grid-cols-2">
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
                      "group flex flex-col items-start gap-2 rounded-2xl border px-4 py-4 text-left transition-all hover:bg-[#fae8c8]",
                      isSelected
                        ? "border-brand-gold bg-[#fae8c8] text-[#8d5814] ring-1 ring-brand-gold"
                        : "border-[#eadfce] bg-[#fff9f1] text-[#7b5d2f]"
                    )}
                  >
                    <div className="flex w-full items-start justify-between">
                      <p className="text-sm font-semibold text-[#1f1a11]">{branch.name}</p>
                      {isSelected && <div className="h-2 w-2 rounded-full bg-brand-gold" />}
                    </div>
                    <p className="text-[11px] text-[#847766] line-clamp-2">{branch.address}</p>
                    <div className="mt-2 flex items-center justify-between w-full text-[10px] text-[#b59c7b]">
                      <span className="uppercase tracking-wider">{branch.operation_hours}</span>
                      {branch.map_url && <a href={branch.map_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="hover:underline flex items-center gap-1"><ExternalLink size={10} /> Peta</a>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#9a8871]">
              <Clock size={14} className="text-[#8d5814]" />
              Waktu ambil
            </span>
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
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#9a8871]">
            <ClipboardList size={14} className="text-[#8d5814]" />
            Catatan
          </span>
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

      {/* Promo Code Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a8871]">Kode Promo</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Masukkan kode..."
            className="flex-1 rounded-xl border border-[#eadfce] bg-[#fff9f1] px-4 py-2 text-sm uppercase focus:outline-none focus:border-brand-gold"
            value={promoCode}
            onChange={e => setPromoCode(e.target.value.toUpperCase())}
            disabled={!!appliedPromo}
          />
          {appliedPromo ? (
            <Button
              variant="outline"
              onClick={() => { setAppliedPromo(null); setPromoCode(''); setPromoMessage(null); }}
              className="rounded-xl border-brand-gold text-[#8d5814] hover:bg-[#fae8c8]"
            >
              Hapus
            </Button>
          ) : (
            <Button
              onClick={handleApplyPromo}
              disabled={!promoCode || isCheckingPromo}
              className="rounded-xl bg-brand-gold text-black hover:bg-[#dfa028]"
            >
              {isCheckingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gunakan'}
            </Button>
          )}
        </div>
        {promoMessage && (
          <div className={cn("text-xs flex items-center gap-1", promoMessage.type === 'success' ? 'text-green-600' : 'text-red-600')}>
            {promoMessage.type === 'success' ? <Ticket size={12} /> : <Info size={12} />}
            {promoMessage.text}
          </div>
        )}
      </div>

      <div className="h-px bg-[#eadfce]" />

      <dl className="space-y-3 text-sm text-[#5c5244]">
        <div className="flex items-center justify-between">
          <dt>Subtotal</dt>
          <dd className="font-semibold text-[#1f1a11]">{currency.format(cartSubtotal)}</dd>
        </div>

        {/* Discount Line */}
        {overview.discount > 0 && (
          <div className="flex items-center justify-between text-red-600">
            <dt className="flex items-center gap-1"><Ticket size={14} /> Diskon ({appliedPromo?.code})</dt>
            <dd className="font-semibold">- {currency.format(overview.discount)}</dd>
          </div>
        )}

        {overview.deliveryFee > 0 && (
          <div className="flex items-center justify-between">
            <dt>Biaya pengantaran</dt>
            <dd className="font-semibold text-[#1f1a11]">{currency.format(overview.deliveryFee)}</dd>
          </div>
        )}
        {overview.codFee > 0 && (
          <div className="flex items-center justify-between">
            <dt>Biaya layanan COD</dt>
            <dd className="font-semibold text-[#1f1a11]">{currency.format(overview.codFee)}</dd>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-[#eadfce] pt-3 text-base">
          <dt className="font-bold text-[#1f1a11]">Total Bayar</dt>
          <dd className="text-xl font-bold text-[#EFB036]">{currency.format(overview.total)}</dd>
        </div>
      </dl>
      <Button
        size="lg"
        className="mt-2 w-full rounded-2xl bg-[#EFB036] text-black shadow-[0_20px_40px_rgba(239,176,54,0.3)] hover:bg-[#d89a28]"
        onClick={step === "review" ? proceedToDetails : handlePlaceOrder}
        disabled={isSubmitting || cartItemCount === 0 || (step === "details" && orderType === "delivery" && !selectedAddressId) || (step === "details" && orderType === "takeaway" && !takeawayForm.branchId)}
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
            <span>Memproses...</span>
          </div>
        ) : step === "review" ? (
          "Lanjut ke Pembayaran"
        ) : (
          "Buat Pesanan Sekarang"
        )}
      </Button>
      <div className="flex items-center justify-center gap-2 text-[10px] text-[#9a8871]">
        <span className="h-3 w-3 rounded-full bg-green-500/20 text-green-700 flex items-center justify-center">✓</span>
        Dijamin aman & terpercaya
      </div>
    </aside>
  );

  // Auto-escape from stuck confirmation state
  useEffect(() => {
    if (step === "confirmation" && !isSubmitting) {
      const timeout = setTimeout(() => {
        console.warn('[checkout] Stuck in confirmation, resetting to review');
        setStep("review");
      }, 5000); // 5 seconds timeout

      return () => clearTimeout(timeout);
    }
  }, [step, isSubmitting]);

  if (step === "confirmation") {
    // Keep modal open, render placeholder background or keep last state
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center px-4 md:px-6">
          <div className="text-center">
            <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-[#eadfce] border-t-brand-gold"></div>
            <h1 className="text-2xl font-bold text-[#1f1a11]">Memproses pesanan...</h1>
            <p className="mt-2 text-[#847766]">Mohon jangan tutup halaman ini.</p>
            <Button
              onClick={() => {
                setStep("review");
                setIsSubmitting(false);
              }}
              variant="ghost"
              className="mt-8 text-sm text-[#9a8871] hover:text-[#8d5814]"
            >
              Kembali ke Keranjang
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1 px-4 pt-28 pb-12 md:px-8 lg:px-12 xl:px-20">
        <div className="mx-auto max-w-7xl">
          <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <button
                onClick={step === "details" ? backToReview : () => router.push("/menu")}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#9a8871] transition-colors hover:text-[#8d5814]"
              >
                <ArrowLeft className="h-4 w-4" />
                {step === "details" ? "Kembali ke review" : "Kembali ke menu"}
              </button>
              <h1 className="mt-4 text-3xl font-bold text-[#1f1a11] md:text-4xl">Konfirmasi Pesanan</h1>
            </div>
            {renderStepper()}
          </header>

          <div className="grid gap-10 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-8">
              {/* Toggle Order Type */}
              <div className="grid grid-cols-2 gap-2 rounded-full border border-[#eadfce] bg-white p-2">
                {[
                  { id: "delivery", icon: MapPin, label: "Delivery" },
                  { id: "takeaway", icon: ClipboardList, label: "Takeaway" }
                ].map((type) => {
                  const isActive = orderType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => {
                        setOrderType(type.id as OrderType);
                        const params = new URLSearchParams(searchParams?.toString());
                        params.set("mode", type.id);
                        router.replace(`/checkout?${params.toString()}`, { scroll: false });
                      }}
                      className={cn(
                        "flex items-center justify-center gap-3 rounded-full py-3 transition-all",
                        isActive
                          ? "bg-[#1f1a11] text-brand-gold shadow-lg"
                          : "text-[#847766] hover:bg-[#fdf6ec]"
                      )}
                    >
                      <type.icon className={cn("h-5 w-5", isActive ? "text-brand-gold" : "text-[#b59c7b]")} />
                      <span className="text-xs font-bold uppercase tracking-[0.24em]">{type.label}</span>
                    </button>
                  );
                })}
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
                  {errorMessage}
                </div>
              )}

              {step === "review" && renderCartReview()}
              {step === "details" && orderType === "delivery" && renderDeliveryForm()}
              {step === "details" && orderType === "takeaway" && renderTakeawayForm()}
            </div>

            <div className="lg:col-span-4">{renderSummary()}</div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Thank You Modal */}
      {showThankYouModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all">
          <div className="relative w-full max-w-md scale-100 overflow-hidden rounded-3xl bg-white p-8 opacity-100 shadow-2xl transition-all">
            <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${thankYouVariant === 'error' ? 'bg-red-100' : 'bg-[#fff4e0]'}`}>
              {thankYouVariant === 'success' && <div className="h-10 w-10 text-brand-gold text-4xl text-center">✓</div>}
              {thankYouVariant === 'error' && <div className="h-10 w-10 text-red-600 text-4xl text-center">!</div>}
              {(thankYouVariant === 'pending' || thankYouVariant === 'cod') && <div className="h-10 w-10 text-brand-gold text-4xl text-center">!</div>}
            </div>

            <h2 className="text-center text-2xl font-bold text-[#1f1a11]">{modalContent.title}</h2>
            <p className="mt-3 text-center text-sm leading-relaxed text-[#847766]">
              {modalContent.description}
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <Button
                onClick={handleViewOrder}
                className="w-full rounded-xl bg-[#1f1a11] py-6 text-xs font-bold uppercase tracking-[0.2em] text-[#EFB036] hover:bg-black"
              >
                Lihat Detail Pesanan
              </Button>
              <Button
                variant="ghost"
                onClick={handleCloseModal}
                className="w-full rounded-xl py-6 text-xs font-bold uppercase tracking-[0.2em] text-[#847766] hover:bg-[#fdf6ec] hover:text-[#5c5244]"
              >
                Kembali ke Beranda
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutPageContent />
    </Suspense>
  );
}
