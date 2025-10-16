'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, Phone, Utensils } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="relative mx-auto mb-16 max-w-[min(96vw,1180px)] overflow-hidden rounded-[36px] border border-black/5 bg-black py-16 sm:mb-20">
      <Image
        src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1920&auto=format&fit=crop"
        alt="Restaurant ambiance"
        fill
        className="object-cover brightness-[0.78] contrast-[1.1]"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/60 to-transparent" />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-12 px-6 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="flex flex-col items-center gap-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-[10px] uppercase tracking-[0.25em] text-white/80 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-brand-gold" />
            Reserve Your Table
          </span>

          <h2 className="text-4xl font-semibold drop-shadow-[0_4px_10px_RGBA(0,0,0,0.6)] sm:text-5xl">
            Nikmati Keaslian Jepang di <span className="text-brand-gold">TakumaEat!</span>
          </h2>

          <p className="max-w-2xl text-lg text-white/85 drop-shadow-[0_2px_6px_RGBA(0,0,0,0.5)]">
            Reservasi meja Anda sekarang dan rasakan pengalaman fine dining autentik dengan cita rasa Jepang sesungguhnya.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
          className="flex flex-wrap items-center justify-center gap-5"
        >
          <Button className="rounded-full bg-brand-gold px-8 py-3 text-base font-semibold text-black shadow-[0_12px_35px_RGBA(239,176,54,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_RGBA(239,176,54,0.45)]">
            Reservasi Sekarang
          </Button>

          <Button
            variant="outline"
            className="rounded-full border border-white/70 bg-white/10 px-8 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-white/20 hover:border-white active:scale-95"
          >
            Lihat Menu
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
