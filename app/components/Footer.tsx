"use client";

import Link from "next/link";
import { Instagram, Mail, MapPin, Music2 } from "lucide-react";

const footerLinks = [
  { href: "#home", label: "Home" },
  { href: "#menu", label: "Menu" },
  { href: "#promo", label: "Promo" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

const socials = [
  { label: "Instagram", href: "https://instagram.com/takumaeat", icon: <Instagram size={18} /> },
  { label: "TikTok", href: "https://tiktok.com/@takumaeat", icon: <Music2 size={18} /> },
  { label: "Email", href: "mailto:hello@takumaeat.com", icon: <Mail size={18} /> },
  { label: "Maps", href: "https://maps.google.com/?q=TakumaEat", icon: <MapPin size={18} /> },
];

export function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription logic here
    console.log("Newsletter subscription submitted");
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#090b13] text-white">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,176,54,0.2)_0%,rgba(239,176,54,0.12)_35%,rgba(239,176,54,0.07)_60%,rgba(9,11,19,0.92)_85%,rgba(9,11,19,1)_100%)]" />

      {/* Main Content */}
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-8 lg:pt-24 lg:pb-12">
        <div className="grid gap-16 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          
          {/* Brand Section */}
          <div className="col-span-2 space-y-6 sm:col-span-2 lg:col-span-1 lg:-mt-1 text-left">
            <div className="flex justify-center sm:justify-start">
              <Link
                href="#home"
                className="inline-flex items-center transition-transform hover:scale-105"
                aria-label="TakumaEat home"
              >
                <span className="text-2xl font-semibold text-transparent drop-shadow-[0_12px_28px_rgba(239,176,54,0.4)] sm:text-3xl">
                  <span className="bg-gradient-to-r from-amber-400 via-brand-gold to-amber-500 bg-clip-text">
                    TakumaEat
                  </span>
                </span>
              </Link>
            </div>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-white/70 sm:mx-0">
              Menyajikan cita rasa Jepang dan Asian Fusion berkualitas premium — 
              dibuat dengan cinta untuk pengalaman kuliner yang tak terlupakan.
            </p>
            <div className="flex items-center justify-center gap-3 text-xs uppercase tracking-wider text-white/40 sm:justify-start">
              <span className="inline-flex h-2 w-2 rounded-full bg-brand-gold animate-pulse" />
              Crafted with Omotenashi Spirit
            </div>
          </div>

          {/* Navigation */}
          <div className="order-1 space-y-6 text-left">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-gold/90">
              Navigation
            </h3>
            <ul className="flex flex-col items-start space-y-4">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-3 text-white/70 transition-all duration-300 hover:text-white hover:translate-x-1"
                  >
                    <span className="h-px w-4 bg-white/20 transition-all duration-300 group-hover:w-8 group-hover:bg-brand-gold" />
                    <span className="text-sm font-medium">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="order-2 space-y-6 text-left">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-gold/90">
              Connect With Us
            </h3>
            <ul className="flex flex-col items-start space-y-4">
              {socials.map((social) => (
                <li key={social.label}>
                  <Link
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 text-white/70 transition-all duration-300 hover:text-white"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all duration-300 group-hover:border-brand-gold/50 group-hover:bg-brand-gold/10 group-hover:text-brand-gold group-hover:shadow-lg group-hover:shadow-brand-gold/20">
                      {social.icon}
                    </span>
                    <span className="text-sm font-medium">{social.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="order-3 col-span-2 space-y-6 sm:col-span-2 lg:col-span-1 text-left">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-gold/90">
              Stay Updated
            </h3>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-sm text-white/70 mb-4">
                Dapatkan info promo & menu baru langsung ke emailmu!
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <input
                    type="email"
                    placeholder="Email kamu"
                    required
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/30 transition-colors"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-brand-gold to-amber-500 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-black shadow-lg shadow-brand-gold/25 transition-all duration-300 hover:shadow-xl hover:shadow-brand-gold/35 hover:scale-105 active:scale-95"
                  >
                    Kirim
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-white/10 pt-5">
          <p className="text-center text-xs uppercase tracking-widest text-white/45">
            © 2025 <span className="text-brand-gold font-semibold">TakumaEat</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}