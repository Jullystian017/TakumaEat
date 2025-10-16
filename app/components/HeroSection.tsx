'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';

const slides = [
  {
    image:
      'https://images.unsplash.com/photo-1661366394743-fe30fe478ef7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    badge: 'Japanese Fine Dining',
    title: 'TakumaEat — Authentic Taste of Japan',
    description: 'Nikmati pengalaman kuliner Jepang modern dengan kualitas premium dan pelayanan hangat.',
    tags: ['Signature Omakase', 'Premium Sushi', 'Tea Ceremony']
  },
  {
    image:
      'https://images.unsplash.com/photo-1590987337915-67134776d6a5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    badge: 'Seasonal Specials',
    title: 'Menu Musim Gugur — Crafted by Our Chefs',
    description: 'Setiap musim menghadirkan cita rasa baru dengan bahan segar pilihan dari Jepang dan Nusantara.',
    tags: ['Autumn Kaiseki', 'Sake Pairing', 'Limited Edition']
  },
  {
    image:
      'https://images.unsplash.com/photo-1592861956120-e524fc739696?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    badge: 'Private Dining Experience',
    title: 'Tatami Room untuk Momen Spesial',
    description: 'Rayakan momen penting bersama keluarga atau kolega di ruang privat dengan layanan eksklusif.',
    tags: ['Private Room', 'Chef Table', 'Curated Pairing']
  }
];

const transitionDuration = 0.8;
const autoSwitchDelay = 9000;

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSlide = useMemo(() => slides[currentIndex], [currentIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoSwitchDelay);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-black pt-28 text-white sm:pt-21 lg:pt-20"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.image}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: transitionDuration, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Image
            src={currentSlide.image}
            alt={currentSlide.title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/45" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,176,54,0.15),transparent_60%)]" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 backdrop-blur-[1px]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
        className="pointer-events-none absolute -left-32 top-32 h-64 w-64 rounded-full bg-brand-gold/15 blur-3xl"
      />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-6 py-30 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.title}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: transitionDuration, ease: 'easeOut' }}
            className="mt-2 space-y-7 sm:mt-16"
          >
            <span className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.28em] text-white/80 backdrop-blur">
              <span className="inline-block h-2 w-2 rounded-full bg-brand-gold" />
              {currentSlide.badge}
            </span>
            <h1 className="text-4xl font-semibold leading-tight tracking-wide text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] sm:text-5xl lg:text-6xl">
              {currentSlide.title}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              {currentSlide.description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              {currentSlide.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/20 bg-white/5 px-4 py-2">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          <Button className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-brand-gold via-amber-200 to-brand-gold px-9 py-4 text-base font-semibold uppercase tracking-[0.20em] text-black shadow-[0_22px_48px_rgba(239,176,54,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_56px_rgba(239,176,54,0.48)]">
            <Link href="/menu" className="inline-flex item-center">
            <span>Jelajahi Menu</span>
            <ArrowRight className="h-5 w-5 *: mt-0.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        <div className="flex items-center justify-center gap-3">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-10 bg-brand-gold' : 'w-3 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
