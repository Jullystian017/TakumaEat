'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    name: 'Aiko Nakamura',
    role: 'Food Critic',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop',
    comment:
      'TakumaEat menghadirkan pengalaman kuliner Jepang yang autentik dengan sentuhan modern yang elegan. Setiap hidangan mencerminkan dedikasi chef.',
  },
  {
    name: 'Michael Tan',
    role: 'Entrepreneur',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop',
    comment:
      'Atmosfer premium, pelayanan hangat, dan rasa luar biasa. Rekomendasi terbaik untuk pengalaman fine dining Jepang di kota.',
  },
  {
    name: 'Sakura Ito',
    role: 'Travel Blogger',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1521579971123-1192931a1452?q=80&w=800&auto=format&fit=crop',
    comment:
      'Dari sushi hingga dessert, semuanya disajikan dengan estetika sempurna. Saya jatuh cinta dengan Matcha Velvet Parfait mereka!',
  },
  {
    name: 'Kenji Watanabe',
    role: 'Restaurateur',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=800&auto=format&fit=crop',
    comment:
      'Teknik memasak yang presisi dan bahan berkualitas tinggi menjadikan setiap menu TakumaEat pantas masuk daftar restoran favorit saya.',
  },
  {
    name: 'Nadia Prameswari',
    role: 'Lifestyle Editor',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1544723795-43253758b6c0?q=80&w=800&auto=format&fit=crop',
    comment:
      'Suasana elegan dengan pelayanan penuh kehangatan. Jamuan bisnis kami selalu berakhir manis bersama dessert spesial TakumaEat.',
  },
  {
    name: 'Ryota Suzuki',
    role: 'Sommelier',
    rating: 4,
    image: 'https://images.unsplash.com/photo-1546539782-6fc531453083?q=80&w=800&auto=format&fit=crop',
    comment:
      'Pairing minuman mereka sangat terkurasi. Kombinasi Junmai Daiginjo dengan sushi omakase menjadi duet yang sulit dilupakan.',
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const nextTestimonial = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prevTestimonial = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateMatch = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', updateMatch);

    return () => mediaQuery.removeEventListener('change', updateMatch);
  }, []);

  const visibleTestimonials = useMemo(() => {
    const visibleCount = isMobile ? 1 : 3;
    return Array.from({ length: visibleCount }, (_, i) => testimonials[(currentIndex + i) % testimonials.length]);
  }, [currentIndex, isMobile]);

  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-black/5 bg-gradient-to-b from-[#fff] to-[#fafafa] py-20 sm:py-28"
    >
      {/* Ambient Light */}
      <div className="pointer-events-none absolute -left-16 top-20 hidden h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl md:block" />
      <div className="pointer-events-none absolute right-0 bottom-10 hidden h-80 w-80 rounded-full bg-black/5 blur-3xl lg:block" />

      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 sm:gap-20 sm:px-6">
        {/* Header */}
        <div className="text-center text-black">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-black/60 sm:px-5">
            <span className="h-2 w-2 rounded-full bg-brand-gold" />
            Testimonials
          </span>
          <h2 className="mt-4 text-3xl font-semibold text-black sm:mt-5 sm:text-5xl">Apa Kata Mereka</h2>
          <p className="mt-3 text-sm text-black/60 sm:mt-4 sm:text-base">
            Cerita dari para tamu yang merasakan pengalaman kuliner premium di{' '}
            <span className="font-semibold text-brand-gold">TakumaEat</span>.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="relative">
          <AnimatePresence initial={false} custom={currentIndex} mode="wait">
            <motion.div
              key={currentIndex}
              custom={currentIndex}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.55, ease: 'easeInOut' }}
              className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {visibleTestimonials.map((testimonial) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <Card className="h-full overflow-hidden border-none bg-white shadow-[0_15px_55px_rgba(0,0,0,0.08)] transition-transform duration-500 hover:-translate-y-2 hover:shadow-[0_22px_65px_rgba(0,0,0,0.1)]">
                    <CardContent className="flex h-full flex-col items-center gap-6 p-8 text-center sm:p-10">
                      <div className="relative h-16 w-16 overflow-hidden rounded-full border-4 border-brand-gold/40 shadow-[0_12px_30px_rgba(239,176,54,0.25)]">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <Quote className="h-7 w-7 text-brand-gold/30 sm:h-8 sm:w-8" />
                      <p className="flex-1 text-sm leading-relaxed text-black/75 sm:text-base">
                        “{testimonial.comment}”
                      </p>
                      <div className="space-y-2">
                        <p className="text-base font-semibold text-black sm:text-lg">{testimonial.name}</p>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-black/45 sm:text-[11px]">{testimonial.role}</p>
                        <div className="flex justify-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const filled = i + 1 <= Math.round(testimonial.rating);
                            return (
                              <span key={i} className={filled ? 'text-brand-gold' : 'text-black/20'}>
                                ★
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-5 sm:mt-12 sm:gap-6">
            <Button
              onClick={prevTestimonial}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-black/10 bg-white text-black shadow transition-all hover:border-brand-gold hover:bg-brand-gold/10 hover:shadow-md sm:h-12 sm:w-12"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'w-6 bg-brand-gold sm:w-8' : 'w-2 bg-black/20 hover:bg-black/40'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={nextTestimonial}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-black/10 bg-white text-black shadow transition-all hover:border-brand-gold hover:bg-brand-gold/10 hover:shadow-md sm:h-12 sm:w-12"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
