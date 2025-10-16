'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Sparkles, Wine, ShoppingCart, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCart } from '@/app/context/CartContext';

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0
});

const foods = [
  {
    name: 'Takuma Sushi Omakase',
    price: 325000,
    image:
      'https://images.unsplash.com/photo-1590987337605-84f3ed4dc29f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description:
      'Koleksi pilihan chef dengan ikan segar premium dan Autentik.',
    tagline: '12 course omakase experience',
    pairing: 'Junmai Daiginjo',
    highlights: ['Seasonal toro', 'Umami dashi', 'Hand-pressed sushi']
  },
  {
    name: 'Black Garlic Tonkotsu Ramen',
    price: 175000,
    image:
      'https://images.unsplash.com/photo-1735357825439-b84a7fba926b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description:
      'Kuah tonkotsu pekat dengan aroma black garlic dan chashu lembut.',
    tagline: 'Rich tonkotsu with black garlic oil',
    pairing: 'Gyokuro Tea',
    highlights: ['12h broth', 'Chashu melt', 'Ajitama egg']
  },
  {
    name: 'Wagyu Truffle Bento',
    price: 285000,
    image:
      'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?q=80&w=1200&auto=format&fit=crop',
    description:
      'Wagyu A5, telur onsen, dan nasi harum truffle yang elegan.',
    tagline: 'Luxurious lunch bento',
    pairing: 'Umeshu Spritz',
    highlights: ['A5 wagyu', 'Truffle rice', 'Onsen egg']
  },
  {
    name: 'Salmon Miso Glaze',
    price: 210000,
    image:
      'https://images.unsplash.com/photo-1534939561126-855b8675edd7?q=80&w=1200&auto=format&fit=crop',
    description:
      'Salmon panggang dengan miso glaze emas dan sayuran musiman.',
    tagline: 'Caramelized miso glaze over salmon',
    pairing: 'Yuzu Highball',
    highlights: ['Smoked miso', 'Charred veggies', 'Sesame crunch']
  },
  {
    name: 'Matcha Velvet Parfait',
    price: 95000,
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop',
    description:
      'Lapisan mousse matcha, sponge lembut, dan crispies emas.',
    tagline: 'Elegant layered dessert',
    pairing: 'Ceremonial Matcha',
    highlights: ['Uji matcha', 'Azuki crumble', 'Velvet mousse']
  },
  {
    name: 'Crispy Ebi Bao',
    price: 125000,
    image:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1200&auto=format&fit=crop',
    description:
      'Ebi tempura renyah dengan saus wasabi honey dalam bao lembut.',
    tagline: 'Street classic reinvented',
    pairing: 'Lychee Sencha',
    highlights: ['Ebi tempura', 'Wasabi honey', 'Steamed bao']
  }
];

export function PopularFoods() {
  const { addItem } = useCart();

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
          {foods.map((food, index) => (
            <motion.div
              key={food.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: (index % 3) * 0.15, duration: 0.6, ease: 'easeOut' }}
              whileHover={{ y: -12 }}
              className="group flex h-full flex-[0_0_78vw] flex-col overflow-hidden rounded-[28px] border border-black/5 bg-white text-left shadow-[0_20px_55px_rgba(15,23,42,0.08)] transition-transform duration-400 hover:-translate-y-3 hover:border-brand-gold/50 hover:shadow-[0_24px_65px_rgba(15,23,42,0.12)] sm:flex-none sm:w-full sm:max-w-none md:max-w-[360px]"
            >
              <div className="relative h-52 w-full overflow-hidden sm:h-64">
                <Image
                  src={food.image}
                  alt={food.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.28em] text-white">
                  <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1">
                    Featured
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-5 p-6 text-black">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-black transition-colors duration-300 group-hover:text-brand-gold sm:text-xl">
                    {food.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-black/65 sm:text-base">{food.description}</p>
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
                    onClick={() =>
                      addItem({
                        name: food.name,
                        price: food.price,
                        image: food.image,
                        note: food.tagline
                      })
                    }
                    className="flex items-center gap-1.5 bg-gradient-to-r from-brand-gold to-amber-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-black shadow-[0_16px_40px_rgba(239,176,54,0.35)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(239,176,54,0.45)] sm:px-5 sm:text-sm"
                    aria-label={`Tambahkan ${food.name} ke keranjang`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
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
