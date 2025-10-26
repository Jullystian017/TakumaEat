"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bike, Store, ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";

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
    <main className="min-h-screen bg-white pb-20 pt-24 text-[#1f1a11]">
      <section className="mx-auto w-full max-w-5xl px-6">
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
                Pilih metode pemenuhan
              </span>
              <h1 className="text-3xl font-semibold tracking-tight text-[#1f1a11] sm:text-4xl">Bagaimana kamu ingin menerima pesananmu?</h1>
              <p className="text-sm text-[#5c5244]">
                Tentukan dulu apakah kamu ingin diantar atau ambil sendiri. Kamu masih bisa mengubah pilihan ini kapan saja sebelum pembayaran selesai.
              </p>
            </div>
          </div>
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {fulfillmentOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => router.push(`/checkout?mode=${option.key}`)}
                className="group flex flex-col gap-6 rounded-3xl border border-[#eadfce] bg-white p-8 text-left shadow-[0_30px_70px_rgba(183,150,111,0.2)] transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#fae8c8] text-[#8d5814]">
                  <Icon className="h-6 w-6" />
                </span>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-[#1f1a11]">{option.title}</h2>
                  <p className="text-sm text-[#5c5244]">{option.description}</p>
                </div>
                <ul className="space-y-2 text-sm text-[#7b6a57]">
                  {option.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#a0792c]" />
                      {detail}
                    </li>
                  ))}
                </ul>
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8d5814]">
                  Pilih {option.title}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
