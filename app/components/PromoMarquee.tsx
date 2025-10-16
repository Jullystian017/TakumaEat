'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const marqueeHighlights = [
  {
    title: 'Chef Signature Omakase',
    subtitle: 'Limited seats nightly',
    discount: 'Save 15%',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=600&auto=format&fit=crop',
    badge: 'Exclusive'
  },
  {
    title: 'Golden Hour Lounge',
    subtitle: 'Mocktail pairing on the house',
    discount: 'Buy 1 Get 1',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop',
    badge: 'Popular'
  },
  {
    title: 'Seasonal Kaiseki Course',
    subtitle: 'Celebrate autumn harvest',
    discount: 'Up to 25% OFF',
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=600&auto=format&fit=crop',
    badge: 'Seasonal'
  },
  {
    title: 'Private Dining Suite',
    subtitle: 'Reserve for special moments',
    discount: 'Complimentary Dessert',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop',
    badge: 'Luxury'
  }
];

export function PromoMarquee() {
  const marqueeItems = [...marqueeHighlights, ...marqueeHighlights];

  return (
    <section className="relative overflow-hidden border-y border-black/5 bg-gradient-to-r from-[#fff7ec] via-white to-[#fff7ec] py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,176,54,0.18),transparent_65%)]" />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white via-white/70 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white via-white/70 to-transparent" />

      <motion.div
        className="flex w-max items-center gap-8 px-10"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
      >
        {marqueeItems.map((item, index) => (
          <motion.article
            key={`${item.title}-${index}`}
            className="group relative flex min-w-[340px] items-center gap-5 rounded-full border border-brand-gold/25 bg-white/80 px-6 py-3 text-black shadow-[0_18px_40px_rgba(239,176,54,0.22)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-[0_22px_48px_rgba(239,176,54,0.35)]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-brand-gold/30">
              <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-300 group-hover:scale-110" />
            </div>

            <div className="flex flex-1 items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-brand-gold/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
                  {item.badge}
                </span>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/85">{item.title}</p>
                <span className="text-xs text-black/60">{item.subtitle}</span>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full border border-brand-gold/40 bg-brand-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold/90">
                <span className="h-2 w-2 rounded-full bg-brand-gold" />
                {item.discount}
              </span>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}