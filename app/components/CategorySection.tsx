'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  color: string;
  icon: string;
}

export function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const total = categories.length;

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.categories) setCategories(data.categories);
      } catch (err) {
        console.error('Fetch categories error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const positionMap = useMemo(() => {
    const prevIndex = (currentIndex - 1 + total) % total;
    const nextIndex = (currentIndex + 1) % total;

    const offset = isMobile ? 160 : 240;
    const inactiveScale = isMobile ? 0.9 : 0.82;
    const inactiveOpacity = isMobile ? 0.55 : 0.45;

    return {
      [prevIndex]: { x: -offset, scale: inactiveScale, opacity: inactiveOpacity, z: 10, blur: isMobile ? 'blur-[2px]' : 'blur-sm' },
      [currentIndex]: { x: 0, scale: 1, opacity: 1, z: 30, blur: 'blur-none' },
      [nextIndex]: { x: offset, scale: inactiveScale, opacity: inactiveOpacity, z: 10, blur: isMobile ? 'blur-[2px]' : 'blur-sm' }
    } as Record<number, { x: number; scale: number; opacity: number; z: number; blur: string }>;
  }, [currentIndex, total, isMobile]);

  const goToCategory = (index: number) => setCurrentIndex(index);

  return (
    <section id="menu" className="relative overflow-hidden border-t border-black/5 bg-white py-16 sm:py-24">
      <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-32 hidden h-72 w-72 rounded-full bg-black/5 blur-3xl lg:block" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 flex flex-col items-center gap-4 text-center text-black sm:mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-black/60 sm:px-5">
            <span className="h-2 w-2 rounded-full bg-brand-gold" />
            Signature Categories
          </span>
          <h2 className="text-2xl font-semibold sm:text-4xl">Discover Our Highlights</h2>
          <p className="max-w-2xl text-sm text-black/60 sm:text-base">
            Seleksi kategori terbaik kami, dikurasi untuk menggambarkan harmoni cita rasa Jepang dan sentuhan Asian Fusion.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 w-24 bg-slate-100 animate-pulse rounded-full" />)}
          </div>
        ) : categories.length === 0 ? null : (
          <div className="mb-10 flex flex-wrap items-center justify-center gap-2 text-black sm:mb-12 sm:gap-3">
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => goToCategory(index)}
                aria-pressed={index === currentIndex}
                className={`group relative whitespace-nowrap rounded-full text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-300 sm:text-sm sm:tracking-[0.16em] ${index === currentIndex
                    ? 'bg-gradient-to-r from-brand-gold to-[#ffe28a] px-6 py-3 text-black shadow-[0_16px_32px_rgba(239,176,54,0.48)] ring-2 ring-brand-gold/80 ring-offset-2 ring-offset-white sm:px-8 sm:py-4'
                    : 'border border-black/15 bg-white/60 px-5 py-2.5 text-black/60 shadow-sm hover:border-brand-gold hover:bg-brand-gold/15 hover:text-black sm:px-6 sm:py-3'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full transition-colors duration-300 ${index === currentIndex ? 'bg-black' : 'bg-black/30 group-hover:bg-brand-gold'
                      }`}
                  />
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="relative mx-auto flex h-[420px] w-full max-w-5xl items-center justify-center sm:h-[480px]">
          {loading ? (
            <div className="h-full w-full max-w-md bg-slate-100 animate-pulse rounded-[32px]" />
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-slate-400">
              <span className="text-4xl mb-4">🍱</span>
              <p className="font-bold">Segera hadir koleksi spesial kami.</p>
            </div>
          ) : categories.map((category, index) => {
            const position = positionMap[index];
            if (!position) return null;

            const isActive = index === currentIndex;

            return (
              <motion.div
                key={category.id}
                layout
                initial={false}
                animate={{ x: position.x, scale: position.scale, opacity: position.opacity }}
                transition={{ duration: 0.55, ease: 'easeInOut' }}
                style={{ zIndex: position.z }}
                className="absolute inset-0 flex items-center justify-center px-1 sm:px-0"
              >
                <div
                  className={`group relative h-full w-full overflow-hidden rounded-[28px] border border-black/5 bg-black/5 shadow-[0_24px_60px_rgba(15,23,42,0.14)] transition-all duration-500 sm:rounded-[32px] ${isActive ? '' : position.blur
                    }`}
                >
                  <Image
                    src={category.image_url || 'https://images.unsplash.com/photo-1590987337605-84f3ed4dc29f?q=80&w=1170&auto=format&fit=crop'}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-[1400ms] group-hover:scale-105"
                    priority={isActive}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />

                  <div className="absolute left-3 top-3 z-[35] inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[9px] uppercase tracking-[0.34em] text-white/80 backdrop-blur sm:left-6 sm:top-6 sm:px-4">
                    <span className="h-2 w-2 rounded-full bg-brand-gold" />
                    {index + 1} / {total}
                  </div>

                  <motion.div
                    initial={false}
                    animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 40 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="absolute inset-x-5 bottom-8 sm:inset-x-8 sm:bottom-10"
                  >
                    <div className="rounded-3xl border border-white/20 bg-black/70 px-5 py-5 text-white shadow-[0_22px_50px_rgba(0,0,0,0.45)] sm:px-8 sm:py-6">
                      <p className="text-[11px] uppercase tracking-[0.34em] text-white/45 sm:text-xs">Signature Category</p>
                      <p className="mt-2 text-2xl font-semibold tracking-[0.18em] sm:mt-3 sm:text-4xl">{category.name}</p>
                      <p className="mt-3 text-xs leading-relaxed text-white/70 sm:mt-4 sm:text-sm">
                        {category.description || 'Eksplorasi menu unggulan TakumaEat dengan cita rasa autentik, bahan premium, dan presentasi modern.'}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[0.32em] text-white/55 sm:mt-6 sm:gap-3 sm:text-[10px]">
                        <span className="rounded-full border border-white/20 px-4 py-1">Premium</span>
                        <span className="rounded-full border border-white/20 px-4 py-1">Chef Choice</span>
                        <span className="rounded-full border border-white/20 px-4 py-1">Seasonal</span>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-6 sm:gap-4">
                        <Button className="rounded-full bg-brand-gold px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-black shadow-[0_15px_35px_rgba(239,176,54,0.42)] transition-transform duration-300 hover:-translate-y-0.5 sm:px-6 sm:text-xs">
                          Lihat Menu
                        </Button>
                      </div>
                    </div>
                  </motion.div>

                  {!isActive && (
                    <div className="absolute inset-x-5 bottom-8 rounded-3xl border border-white/15 bg-black/55 px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.22em] text-white/80 sm:inset-x-8 sm:bottom-10 sm:px-6 sm:text-sm sm:tracking-[0.26em]">
                      {category.name}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

        </div>
      </div>
    </section>
  );
}