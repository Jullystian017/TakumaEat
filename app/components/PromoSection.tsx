'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

const promos = [
  {
    title: 'Weekend Special Promo',
    description:
      'Diskon 20% untuk menu sharing platter setiap Jumat-Minggu. Nikmati pengalaman dining bersama keluarga dan sahabat.',
    highlight: 'Limited Weekend Offer',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=1200&auto=format&fit=crop',
    badges: ['Sharing Menu', '20% OFF', '3 Days Only'],
    code: 'WEEKEND20'
  },
  {
    title: 'Lunch Set Discount',
    description:
      'Hemat 25k untuk paket lunch set pilihan setiap Senin-Jumat. Datang sebelum pukul 14.00 untuk promo spesial ini.',
    highlight: 'Midday Delight',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200&auto=format&fit=crop',
    badges: ['Weekday Promo', 'Lunch Only', 'Save 25K'],
    code: 'LUNCHSET25'
  }
];

export function PromoSection() {
  return (
    <section id="promo" className="relative overflow-hidden border-t border-black/5 bg-white py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(239,176,54,0.18),transparent_60%)]" />
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6">
        <div className="flex flex-col items-center gap-4 text-center text-black">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-5 py-2 text-xs uppercase tracking-[0.32em] text-black/60">
            <span className="h-2 w-2 rounded-full bg-brand-gold" />
            Seasonal Promos
          </span>
          <h2 className="text-3xl font-semibold sm:text-4xl">Promo Spesial TakumaEat</h2>
          <p className="max-w-2xl text-black/60">
            Nikmati penawaran eksklusif dengan sentuhan premium, dirancang untuk menghadirkan pengalaman kuliner terbaik bagi Anda.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {promos.map((promo, index) => (
            <motion.div
              key={promo.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.15, duration: 0.6, ease: 'easeOut' }}
              whileHover={{ y: -12 }}
              className="group relative h-[420px] overflow-hidden rounded-[32px] border border-black/5 bg-black/5 shadow-[0_26px_55px_rgba(15,23,42,0.12)] transition-all duration-300 hover:shadow-[0_32px_70px_rgba(15,23,42,0.16)]"
            >
              <Image
                src={promo.image}
                alt={promo.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/5" />

              <div className="absolute left-6 top-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[10px] uppercase tracking-[0.32em] text-white/70 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-brand-gold" />
                  {promo.highlight}
                </span>

              </div>

              <div className="absolute inset-x-6 bottom-6">
                <div className="space-y-5 rounded-[26px] border border-white/15 bg-black/70 px-6 py-6 text-white shadow-[0_20px_45px_rgba(0,0,0,0.5)] backdrop-blur-sm">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-2xl font-semibold sm:text-3xl">{promo.title}</h3>
                    <p className="text-sm text-white/70 whitespace-pre-line">{promo.description}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {promo.badges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/60"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 text-white/70">
                      <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.28em]">
                        <span className="h-2 w-2 rounded-full bg-brand-gold" />
                        Berlaku hingga 30 Okt
                      </span>
                    </div>
                    <button className="inline-flex items-center gap-2 text-sm font-medium text-brand-gold transition-colors duration-300 hover:text-brand-gold/80">
                      Lihat Detail
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
          className="flex justify-center"
        >
          <Button asChild className="group flex items-center gap-2 bg-brand-gold px-8 py-4 text-base text-black shadow-[0_18px_40px_rgba(239,176,54,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(239,176,54,0.45)]">
            <Link href="/promo" className="inline-flex items-center gap-2">
              <span>View All Promo</span>
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
