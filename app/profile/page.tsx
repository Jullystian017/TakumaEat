"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { LucideIcon } from "lucide-react";
import { BellRing, ClipboardList, KeyRound, LogOut, MapPin, UserRound, ArrowRight, Sparkles } from "lucide-react";

import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mainMenuItems: {
  label: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  ctaLabel: string;
  action?: "logout";
}[] = [
  {
    label: "My Profile",
    description: "Perbarui informasi pribadi, foto profil, dan preferensi akunmu.",
    icon: UserRound,
    href: "/profile",
    ctaLabel: "Kelola Profil"
  },
  {
    label: "My Orders",
    description: "Lihat status pesanan aktif dan riwayat transaksi sebelumnya.",
    icon: ClipboardList,
    href: "/orders",
    ctaLabel: "Lihat Pesanan"
  },
  {
    label: "Notifications",
    description: "Pantau pembaruan terbaru tentang pesanan dan promo spesial.",
    icon: BellRing,
    href: "/notifications",
    ctaLabel: "Buka Notifikasi"
  },
  {
    label: "Logout",
    description: "Keluar dari akun TakumaEat dan jaga keamanan datamu.",
    icon: LogOut,
    ctaLabel: "Logout",
    action: "logout"
  }
];

const profileSubMenus: {
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
}[] = [
  {
    label: "Change Password",
    description: "Gunakan kata sandi yang kuat dan perbarui secara berkala.",
    icon: KeyRound,
    href: "/profile/change-password"
  },
  {
    label: "Saved Address",
    description: "Tambah atau edit alamat favorit untuk pengantaran lebih cepat.",
    icon: MapPin,
    href: "/profile/saved-addresses"
  }
];

export default function ProfilePage() {
  const router = useRouter();
  const { status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent("/profile")}`);
    }
  }, [sessionStatus, router]);

  const handleLogout = () => {
    signOut();
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pb-24 pt-32 text-[#1f1a11]">

        <section className="relative mx-auto w-full max-w-5xl px-6">
          <header className="space-y-4 border-b border-[#d0bfa6]/40 pb-8">
            <div className="flex items-center gap-3">
              <Badge className="w-fit rounded-full border-none bg-[#f4e7d6] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8d5814] shadow-sm">
                Akun Saya
              </Badge>
            </div>
            <div className="space-y-3">
              <h1 className="bg-gradient-to-r from-[#1f1a11] to-[#5c5244] bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
                Kelola akun TakumaEat-mu
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-[#5c5244]">
                Akses cepat ke profil, pesanan, dan notifikasi. Pastikan informasi pribadimu selalu terbaru agar pengalaman memesan tetap lancar.
              </p>
            </div>
          </header>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {mainMenuItems.map((item, index) => (
              <article
                key={item.label}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-[#eadfce] bg-white p-6 shadow-[0_24px_60px_rgba(183,150,111,0.16)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_32px_80px_rgba(183,150,111,0.24)]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Decorative gradient overlay */}
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#fff8ee] to-transparent opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                
                <div className="relative flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#eadfce] bg-gradient-to-br from-[#fff8ee] to-[#fff2dd] text-[#a0792c] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-[#d0bfa6] group-hover:shadow-md">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-[#1f1a11] transition-colors group-hover:text-[#8d5814]">
                        {item.label}
                      </h2>
                      {item.label === "My Profile" && (
                        <Badge className="rounded-full border-none bg-black px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white shadow-lg">
                          Aktif
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-[#5c5244]">{item.description}</p>
                  </div>
                </div>
                
                <div className="relative mt-6 flex items-center justify-between border-t border-[#eadfce]/50 pt-4">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#b59c7b]">
                    {item.label === "My Profile" ? "Halaman saat ini" : "Navigasi Cepat"}
                  </span>
                  {item.action === "logout" ? (
                    <Button
                      type="button"
                      onClick={handleLogout}
                      className="group/btn rounded-full bg-brand-gold px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-black shadow-[0_18px_36px_rgba(239,176,54,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_24px_48px_rgba(239,176,54,0.4)]"
                    >
                      {item.ctaLabel}
                      <LogOut className="ml-2 inline-block h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className="group/btn rounded-full bg-brand-gold px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-black shadow-[0_18px_36px_rgba(239,176,54,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_24px_48px_rgba(239,176,54,0.4)]"
                    >
                      <Link href={item.href!}>
                        {item.ctaLabel}
                        <ArrowRight className="ml-2 inline-block h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>

          <section className="relative mt-12 overflow-hidden rounded-3xl border border-[#eadfce] bg-white p-8 shadow-[0_26px_60px_rgba(183,150,111,0.16)]">
            {/* Decorative corner accent */}
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-[#f4e7d6]/30 to-transparent blur-3xl" />
            
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-[#1f1a11]">Detail Profil</h2>
                <p className="max-w-xl text-sm leading-relaxed text-[#5c5244]">
                  Atur keamanan akun dan informasi pengantaran favoritmu lewat submenu berikut.
                </p>
              </div>
              <Badge 
                className="w-fit rounded-full border border-[#eadfce] bg-[#fff6eb] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-[#7b5d2f] shadow-sm"
              >
                2 Submenu
              </Badge>
            </div>
            
            <div className="relative mt-8 grid gap-4 sm:grid-cols-2">
              {profileSubMenus.map((submenu, index) => (
                <Link
                  key={submenu.label}
                  href={submenu.href}
                  className="group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-[#eadfce] bg-gradient-to-br from-[#fff8ee] to-[#fffbf5] px-5 py-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/60 hover:bg-gradient-to-br hover:from-[#fff2dd] hover:to-[#fff8ee] hover:shadow-lg"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Hover shine effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#eadfce] bg-white text-[#a0792c] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-brand-gold/60 group-hover:text-[#8d5814] group-hover:shadow-md">
                    <submenu.icon className="h-6 w-6" />
                  </div>
                  
                  <div className="relative space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-[#1f1a11] transition-colors group-hover:text-[#8d5814]">
                        {submenu.label}
                      </h3>
                      <ArrowRight className="h-4 w-4 text-[#b59c7b] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                    </div>
                    <p className="text-sm leading-relaxed text-[#5c5244]">{submenu.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}