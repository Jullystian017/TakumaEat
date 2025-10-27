"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bike, Store, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useCart } from "@/app/context/CartContext";

const fulfillmentOptions = [
  {
    key: "delivery" as const,
    title: "Delivery",
    description: "Kurir TakumaEat akan mengantar pesananmu langsung ke alamat yang kamu tentukan.",
    details: ["Jangkauan hingga 15KM", "Bisa pilih jadwal pengantaran", "Pembayaran via Midtrans"],
    icon: Bike
  },
  {
    key: "takeaway" as const,
    title: "Takeaway",
    description: "Ambil sendiri pesananmu di cabang favorit dan nikmati proses yang super cepat.",
    details: ["Pilih cabang & waktu ambil", "Boleh bayar di tempat", "Antrian prioritas pelanggan app"],
    icon: Store
  }
];

export default function CheckoutStartPage() {
  const router = useRouter();
  const { status } = useSession();
  const { cartItemCount } = useCart();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent("/checkout/start")}`);
    }
  }, [status, router]);

  useEffect(() => {
    if (cartItemCount === 0) {
      router.replace("/menu");
    }
  }, [cartItemCount, router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#fdf9f1] via-white to-[#fff5e8] pb-20 pt-24 text-[#1f1a11]">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand-gold/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#f1d7a4]/20 blur-[120px]" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 border-b border-[#d0bfa6]/30 pb-8"
        >
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 rounded-full border border-[#d0bfa6]/60 bg-white px-4 py-2 text-sm font-medium text-[#1f1a11] shadow-sm transition-all hover:scale-105 hover:border-brand-gold/40 hover:bg-[#f4e7d6] hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Kembali</span>
          </Button>

          {/* Header content */}
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f4e7d6] to-[#fae8c8] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8d5814] shadow-sm sm:text-[11px]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Pilih metode pemenuhan
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#1f1a11] sm:text-3xl lg:text-4xl">
              Bagaimana kamu ingin menerima pesananmu?
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[#5c5244] sm:text-base">
              Tentukan dulu apakah kamu ingin diantar atau ambil sendiri. Kamu masih bisa mengubah pilihan ini kapan saja sebelum pembayaran selesai.
            </p>
          </div>
        </motion.header>

        <div className="mt-10 grid gap-6 sm:gap-8 lg:grid-cols-2">
          {fulfillmentOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.button
                key={option.key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                type="button"
                onClick={() => router.push(`/checkout?mode=${option.key}`)}
                className="group relative flex flex-col gap-6 overflow-hidden rounded-3xl border border-[#eadfce] bg-white p-6 text-left shadow-[0_20px_60px_rgba(183,150,111,0.15)] transition-all duration-300 hover:-translate-y-2 hover:border-brand-gold/40 hover:shadow-[0_30px_80px_rgba(183,150,111,0.25)] sm:p-8"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
                <div className="relative">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fae8c8] to-[#f4e7d6] text-[#8d5814] shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg sm:h-16 sm:w-16">
                    <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                  </span>
                </div>
                
                <div className="relative space-y-3">
                  <h2 className="text-xl font-bold text-[#1f1a11] transition-colors duration-300 group-hover:text-[#8d5814] sm:text-2xl">
                    {option.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-[#5c5244] sm:text-base">
                    {option.description}
                  </p>
                </div>
                
                <ul className="relative space-y-3 text-sm text-[#7b6a57]">
                  {option.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-3">
                      <span className="mt-1.5 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-gradient-to-br from-brand-gold to-[#d89a28]" />
                      <span className="flex-1">{detail}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="relative mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-[#8d5814] transition-all duration-300 group-hover:gap-3">
                  <span>Pilih {option.title}</span>
                  <ArrowLeft className="h-4 w-4 rotate-180 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
