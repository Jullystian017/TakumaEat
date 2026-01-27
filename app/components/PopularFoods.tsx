'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Sparkles, Wine, ShoppingCart, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCart } from '@/app/context/CartContext';
import { cn } from '@/lib/utils';

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0
});

interface FoodItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  description: string;
  status: string;
  stock: number;
  highlights?: string[];
  tagline?: string;
  categories?: { name: string };
}

export function PopularFoods() {
  const { addItem } = useCart();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPopular() {
      try {
        setLoading(true);
        const res = await fetch('/api/menu/popular');
        const data = await res.json();
        if (data.items) setFoods(data.items);
      } catch (err) {
        console.error('Fetch popular foods error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPopular();
  }, []);

  return (
    <section id="about" className="relative overflow-hidden border-t border-black/5 bg-white py-16 sm:py-24">
      <div className="pointer-events-none absolute -right-28 top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:gap-16 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center text-black">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-2 text-[11px] uppercase tracking-[0.32em] text-black/60 sm:px-5">
            <span className="h-2 w-2 rounded-full bg-brand-gold" />
            Popular Menu
          </span>
          <h2 className="text-2xl font-semibold sm:text-4xl">Makanan Populer</h2>
          <p className="max-w-2xl text-sm text-black/60 sm:text-base">
            Favorit pelanggan kami yang wajib dicoba ketika berkunjung ke TakumaEat. Setiap hidangan dikurasi dengan bahan premium dan cita rasa autentik.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
              <Sparkles className="h-4 w-4 text-brand-gold" />
              <span className="text-xs font-medium text-black/70 sm:text-sm">Best Seller</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
              <Clock className="h-4 w-4 text-brand-gold" />
              <span className="text-xs font-medium text-black/70 sm:text-sm">Fresh Daily</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
              <Wine className="h-4 w-4 text-brand-gold" />
              <span className="text-xs font-medium text-black/70 sm:text-sm">Chef Recommended</span>
            </div>
          </div>
        </div>

        <div className="hide-scrollbar flex gap-6 overflow-x-auto overflow-y-hidden px-5 pb-6 pr-14 snap-x snap-mandatory [scrollbar-width:none] sm:mx-0 sm:flex-none sm:overflow-visible sm:px-0 sm:pb-0 sm:gap-8 sm:pr-0 sm:grid sm:grid-cols-2 xl:grid-cols-3 sm:snap-none">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[400px] w-full animate-pulse rounded-[28px] bg-slate-100" />
            ))
          ) : foods.length === 0 ? (
            <div className="col-span-full py-10 text-center text-slate-400">Belum ada menu populer saat ini.</div>
          ) : foods.map((food, index) => (
            <motion.div
              key={food.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: (index % 3) * 0.15, duration: 0.6, ease: 'easeOut' }}
              whileHover={{ y: -12 }}
              className="group flex h-full flex-[0_0_78vw] flex-col overflow-hidden rounded-[28px] border border-black/5 bg-white text-left shadow-[0_20px_55px_rgba(15,23,42,0.08)] transition-transform duration-400 hover:-translate-y-3 hover:border-brand-gold/50 hover:shadow-[0_24px_65px_rgba(15,23,42,0.12)] sm:flex-none sm:w-full sm:max-w-none md:max-w-[360px]"
            >
              <div className="relative h-52 w-full overflow-hidden sm:h-64">
                <Image
                  src={food.image_url || '/logotakuma.png'}
                  alt={food.name}
                  fill
                  className={cn("object-cover transition-transform duration-700 group-hover:scale-110", food.stock === 0 && "grayscale opacity-50")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.28em] text-white">
                  <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1">
                    {food.stock === 0 ? 'Out of Stock' : 'Popular'}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-5 p-6 text-black">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-black transition-colors duration-300 group-hover:text-brand-gold sm:text-xl">
                    {food.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-black/65 sm:text-base line-clamp-2">{food.description}</p>
                  {food.highlights?.length ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {food.highlights.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-black/60 transition-colors duration-300 group-hover:border-brand-gold/50 group-hover:text-brand-gold"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-lg font-semibold text-brand-gold sm:text-xl">
                    {currencyFormatter.format(food.price)}
                  </span>
                  <Button
                    type="button"
                    disabled={food.stock === 0}
                    onClick={() =>
                      addItem({
                        name: food.name,
                        price: food.price,
                        image: food.image_url || '/logotakuma.png',
                        note: food.description
                      })
                    }
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-all duration-300 sm:px-5 sm:text-sm",
                      food.stock === 0
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-brand-gold to-amber-300 text-black shadow-[0_16px_40px_rgba(239,176,54,0.35)] hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(239,176,54,0.45)]"
                    )}
                    aria-label={`Tambahkan ${food.name} ke keranjang`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {food.stock === 0 ? 'Habis' : 'Add to Cart'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
          }
        `}</style>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
          className="flex justify-center"
        >
          <Button asChild className="group flex items-center gap-2 bg-brand-gold px-6 py-3 text-sm text-black shadow-[0_18px_40px_rgba(239,176,54,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(239,176,54,0.45)] sm:px-8 sm:py-4 sm:text-base">
            <Link href="/menu">
              <span>View All Menu</span>
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
