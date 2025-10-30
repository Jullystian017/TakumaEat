'use client';

import type { MouseEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, ShoppingCart, X } from 'lucide-react';

import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';
import { PromoMarquee } from '@/app/components/PromoMarquee';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCart } from '@/app/context/CartContext';

const categories = ['All', 'Sushi & Rolls', 'Ramen & Udon', 'Bento', 'Dessert', 'Drink'] as const;

type Category = (typeof categories)[number];

// Helper function to convert price string (e.g., "Rp 365.000") to number
const parsePriceString = (priceStr: string): number => {
  return Number(priceStr.replace(/[^0-9]/g, ''));
};

type MenuItem = {
  id: number;
  name: string;
  category: Exclude<Category, 'All'>;
  price: string;
  description: string;
  image: string;
  highlights: string[];
  calories: string;
};

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Takuma Omakase Nigiri',
    category: 'Sushi & Rolls',
    price: 'Rp 365.000',
    description: '12 potong nigiri premium dengan seasonal catch, brushed soy, dan garnish berlapis emas.',
    image:
      'https://images.unsplash.com/photo-1540713304937-18ad930d3594?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
    highlights: ['Chef Signature', 'Limited 18 servings/day', 'Paired with ginjo shoyu'],
    calories: '420 kkal'
  },
  {
    id: 2,
    name: 'Golden Dragon Roll',
    category: 'Sushi & Rolls',
    price: 'Rp 189.000',
    description: 'Roll gurita panggang, otoro tartare, dan saus yuzu miso dengan tobiko emas.',
    image:
      'https://images.unsplash.com/photo-1657662378832-a22aebb16873?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDZ8fHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=600',
    highlights: ['Smoked Octopus', 'Yuzu miso glaze', 'Crunchy tempura'],
    calories: '360 kkal'
  },
  {
    id: 3,
    name: 'Black Garlic Tonkotsu',
    category: 'Ramen & Udon',
    price: 'Rp 185.000',
    description: 'Kuah tonkotsu 18 jam, burnt black garlic oil, chashu torched, dan ramen handmade.',
    image:
      'https://images.unsplash.com/photo-1618889482923-38250401a84e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170',
    highlights: ['18h simmer', 'Onsen egg', 'Wood ear crunch'],
    calories: '540 kkal'
  },
  {
    id: 4,
    name: 'Truffle Shoyu Ramen',
    category: 'Ramen & Udon',
    price: 'Rp 165.000',
    description: 'Shoyu broth infused truffle, duck chashu, menma smoked, dan aroma kombu.',
    image:
      'https://images.unsplash.com/photo-1505935428862-770b6f24f629?q=80&w=1200&auto=format&fit=crop',
    highlights: ['Truffle aroma', 'Hand-pulled noodle', 'Duck chashu'],
    calories: '510 kkal'
  },
  {
    id: 5,
    name: 'Wagyu Luxe Bento',
    category: 'Bento',
    price: 'Rp 298.000',
    description: 'Wagyu A5 sear, tamago souffle, kinoko butter rice, dan pickles ume.',
    image:
      'https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=1200&auto=format&fit=crop',
    highlights: ['A5 wagyu', 'Truffle rice', 'Smoked pickles'],
    calories: '630 kkal'
  },
  {
    id: 6,
    name: 'Sakura Chicken Bento',
    category: 'Bento',
    price: 'Rp 178.000',
    description: 'Ayam sous-vide saus sakura glaze, harumaki salad, dan miso soup mini.',
    image:
      'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?q=80&w=1200&auto=format&fit=crop',
    highlights: ['Sous-vide', 'Sakura glaze', 'Balanced macros'],
    calories: '480 kkal'
  },
  {
    id: 7,
    name: 'Matcha Velvet Parfait',
    category: 'Dessert',
    price: 'Rp 102.000',
    description: 'Parfait mousse matcha, chiffon vanilla, azuki crumble, dan white chocolate shard.',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop',
    highlights: ['Uji matcha', 'Azuki crumble', 'Silky mousse'],
    calories: '320 kkal'
  },
  {
    id: 8,
    name: 'Yuzu Silk Cheesecake',
    category: 'Dessert',
    price: 'Rp 98.000',
    description: 'Cheesecake no-bake, cloud cream, sable crunch, dan gel yuzu segar.',
    image:
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=1200&auto=format&fit=crop',
    highlights: ['No-bake', 'Yuzu gel', 'Feather-light texture'],
    calories: '290 kkal'
  },
  {
    id: 9,
    name: 'Kyoto Cold Brew',
    category: 'Drink',
    price: 'Rp 68.000',
    description: 'Cold brew single origin Kyoto, cascara syrup, dan ice sphere citrus.',
    image:
      'https://images.unsplash.com/photo-1613503399741-4cd0ed8fbce2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687',
    highlights: ['24h brew', 'Cascara syrup', 'Citrus mist'],
    calories: '90 kkal'
  },
  {
    id: 10,
    name: 'Sakura Fizz Mocktail',
    category: 'Drink',
    price: 'Rp 72.000',
    description: 'Infused sakura petals, lychee shrub, sparkling tea, dan edible blossom.',
    image:
      'https://images.unsplash.com/photo-1527169402691-feff5539e52c?q=80&w=1200&auto=format&fit=crop',
    highlights: ['Zero alcohol', 'House-made shrub', 'Edible flower'],
    calories: '110 kkal'
  }
];

export default function MenuPage() {
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredMenu = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return menuItems.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = !normalized
        ? true
        : `${item.name} ${item.description} ${item.highlights.join(' ')}`
            .toLowerCase()
            .includes(normalized);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredMenu.length / itemsPerPage)), [filteredMenu.length, itemsPerPage]);

  const paginatedMenu = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMenu.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMenu, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedItem]);

  return (
    <main className="relative min-h-screen bg-white text-slate-900 font-poppins">
      <Navbar />
      <section id="menu" className="relative overflow-hidden bg-white pt-20 pb-20 sm:pt-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(239,176,54,0.12),transparent_70%)]" />
        <div className="pointer-events-none absolute inset-y-0 -left-32 hidden w-64 rounded-full bg-brand-gold/15 blur-3xl md:block" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-100/40 blur-3xl" />

        <div className="relative mx-auto flex max-w-[min(95vw,1440px)] flex-col gap-10 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-[40px] border border-slate-200 shadow-[0_28px_70px_rgba(15,23,42,0.22)]"
          >
            <Image
              src="https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1600&auto=format&fit=crop"
              alt="TakumaEat fine dining"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1280px) 100vw, (min-width: 768px) 90vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/45 to-transparent" />
            <div className="relative z-10 flex min-h-[320px] flex-col items-center justify-center gap-5 px-6 py-14 text-center text-white sm:min-h-[400px] sm:px-12 sm:py-20">
              <span className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.28em] text-white/80 backdrop-blur">
                <span className="inline-block h-2 w-2 rounded-full bg-brand-gold" />
                Menu Signature
              </span>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold leading-tight tracking-wide sm:text-5xl lg:text-6xl">
                Premium Dishes Collection
                </h1>
                <p className="mx-auto max-w-2xl text-base text-white/75 sm:text-lg">
                  Eksplor pilihan menu unggulan kami yang dirancang dengan teknik tradisional Jepang dan bahan musiman terbaik. Pilih kategori favoritmu dan langsung temukan hidangan favoritmu.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] uppercase tracking-[0.3em] text-white/70">
                <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1">Seasonal picks</span>
                <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1">Premium ingredients</span>
                <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1">Fine dining</span>
              </div>
            </div>
          </motion.div>

          <style jsx>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto pb-1 sm:gap-3 lg:flex-wrap lg:overflow-visible lg:pb-0">
              {categories.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    aria-pressed={isActive}
                    className={cn(
                      'group relative whitespace-nowrap rounded-full text-[10px] font-semibold uppercase tracking-[0.18em] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:text-xs sm:tracking-[0.2em]',
                      isActive
                        ? 'bg-gradient-to-r from-brand-gold to-[#ffe28a] px-6 py-3 text-black shadow-[0_16px_32px_rgba(239,176,54,0.42)] ring-1 ring-brand-gold/70'
                        : 'border border-black/15 bg-white/70 px-5 py-2.5 text-black/60 shadow-sm hover:border-brand-gold hover:bg-brand-gold/15 hover:text-black sm:px-6 sm:py-3'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full transition-colors duration-300',
                          isActive ? 'bg-black' : 'bg-black/30 group-hover:bg-brand-gold'
                        )}
                      />
                      {category}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="relative w-full lg:w-[360px] xl:w-[420px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Cari menu favoritmu"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-full border border-slate-300 bg-white py-3 pl-11 pr-5 text-sm text-slate-700 placeholder:text-slate-400 shadow-[0_14px_30px_rgba(15,23,42,0.08)] focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
              />
            </div>
          </motion.div>

          <motion.div
            layout
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } }
            }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
          >
            <AnimatePresence initial={false}>
              {filteredMenu.length > 0 ? (
                paginatedMenu.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.96 }}
                    transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
                    whileHover={{ y: -6, scale: 1.01 }}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedItem(item)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedItem(item);
                      }
                    }}
                    className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white text-left shadow-[0_24px_55px_rgba(15,23,42,0.08)] transition-all duration-500 hover:-translate-y-2 hover:border-brand-gold/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50"
                  >
                    <div className="relative h-60 w-full overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(min-width: 1280px) 360px, (min-width: 768px) 45vw, 90vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
                      <div className="absolute bottom-4 left-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.28em] text-white">
                        <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-5 p-6">
                      <div className="space-y-3">
                        <h3 className="text-xl font-semibold text-slate-900 transition-colors duration-300 group-hover:text-brand-gold">
                          {item.name}
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-600">
                          {item.description}
                        </p>
                      </div>
                      <div className="mt-auto h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-semibold text-brand-gold">
                          {item.price}
                        </span>
                        <Button
                          className="flex items-center gap-1.5 bg-gradient-to-r from-brand-gold to-amber-300 px-5 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-black shadow-[0_20px_45px_rgba(239,176,54,0.35)] transition-transform duration-300 hover:-translate-y-1"
                          onClick={(event) => {
                            event.stopPropagation();
                            addItem({
                              name: item.name,
                              price: parsePriceString(item.price),
                              image: item.image,
                              note: item.description
                            });
                          }}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full rounded-3xl border border-slate-200 bg-white p-16 text-center text-slate-500 shadow-[0_24px_55px_rgba(15,23,42,0.08)]"
                >
                  Tidak ada menu yang cocok dengan pencarianmu.
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {totalPages > 1 && (
            <motion.nav
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.45, ease: 'easeOut' }}
              className="flex flex-col items-center gap-3 pt-6 sm:flex-row sm:justify-center"
            >
              <div className="text-xs uppercase tracking-[0.32em] text-slate-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-full border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-[0_10px_25px_rgba(15,23,42,0.1)] transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <Button
                  className="flex items-center gap-2 rounded-full bg-brand-gold px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-black shadow-[0_18px_40px_rgba(239,176,54,0.35)] transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.nav>
          )}
        </div>
      </section>

      <div className="mt-20">
        <PromoMarquee />
      </div>

      <Footer />

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            key="menu-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              className="relative mx-4 w-full max-w-3xl overflow-hidden rounded-[36px] border border-white/10 bg-[#0b0b0d] text-white shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                aria-label="Close"
                className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors duration-300 hover:bg-brand-gold hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
                <div className="relative h-60 w-full overflow-hidden md:h-full">
                  <Image
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    fill
                    sizes="(min-width: 768px) 50vw, 90vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 space-y-2 text-sm uppercase tracking-[0.32em] text-white/70">
                    <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1">
                      {selectedItem.category}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-brand-gold/90 px-4 py-1 text-black">
                      Signature TakumaEat
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-6 p-8 md:p-10">
                  <div className="space-y-4">
                    <h2 className="text-3xl font-semibold text-white">{selectedItem.name}</h2>
                    <p className="text-base leading-relaxed text-white/70">
                      {selectedItem.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.26em] text-white/45">
                      {selectedItem.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-auto flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                    <div className="flex items-center justify-between text-lg">
                      <span className="text-white/60">Kalori</span>
                      <span className="text-brand-gold font-semibold">{selectedItem.calories}</span>
                    </div>
                    <div className="flex items-center justify-between text-xl font-semibold">
                      <span className="text-white/60">Harga</span>
                      <span className="text-brand-gold">{selectedItem.price}</span>
                    </div>
                    <Button 
                      className="flex items-center justify-center gap-2 bg-brand-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-black shadow-[0_25px_55px_rgba(239,176,54,0.45)]"
                      onClick={() => {
                        addItem({
                          name: selectedItem.name,
                          price: parsePriceString(selectedItem.price),
                          image: selectedItem.image,
                          note: selectedItem.description
                        });
                        setSelectedItem(null);
                      }}
                    >
                      <ShoppingCart className="h-5 w-5" /> Tambah ke Keranjang
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
