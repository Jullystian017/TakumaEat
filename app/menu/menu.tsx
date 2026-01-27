'use client';

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

export default function MenuPage() {
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 8;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [menuRes, catRes] = await Promise.all([
          fetch('/api/admin/menu'),
          fetch('/api/admin/categories')
        ]);

        const menuData = await menuRes.json();
        const catData = await catRes.json();

        if (menuData.menuItems) {
          setMenuItems(menuData.menuItems);
        }
        if (catData.categories) {
          setCategories(['All', ...catData.categories.map((c: any) => c.name)]);
        }
      } catch (error) {
        console.error('Failed to fetch menu data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredMenu = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return menuItems.filter((item) => {
      const categoryName = item.categories?.name || 'Uncategorized';
      const matchesCategory = activeCategory === 'All' || categoryName === activeCategory;
      const matchesSearch = !normalized
        ? true
        : `${item.name} ${item.description}`
          .toLowerCase()
          .includes(normalized);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm, menuItems]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredMenu.length / itemsPerPage)), [filteredMenu.length, itemsPerPage]);

  const paginatedMenu = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMenu.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMenu, currentPage, itemsPerPage]);

  function formatCurrency(price: number | string) {
    const val = typeof price === 'string' ? Number(price) : price;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  }

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
    <main className="relative min-h-screen bg-white text-slate-900 font-noto">
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
                  Eksplor pilihan menu unggulan kami yang dirancang dengan teknik tradisional Jepang dan bahan musiman terbaik.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:flex-wrap lg:overflow-visible no-scrollbar">
              {categories.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={cn(
                      'whitespace-nowrap rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-all duration-300',
                      isActive
                        ? 'bg-brand-gold text-black shadow-lg ring-1 ring-brand-gold/70'
                        : 'border border-slate-200 bg-white/70 text-slate-600 hover:border-brand-gold hover:text-black'
                    )}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
            <div className="relative w-full lg:w-[360px]">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Cari menu favoritmu"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-5 text-sm shadow-sm focus:ring-2 focus:ring-brand-gold/20 outline-none"
              />
            </div>
          </motion.div>

          <motion.div layout className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {loading ? (
                // Skeleton Loaders
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm animate-pulse">
                    <div className="h-64 bg-slate-200" />
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-slate-200 rounded w-3/4" />
                      <div className="h-4 bg-slate-100 rounded w-full" />
                      <div className="h-4 bg-slate-100 rounded w-5/6" />
                      <div className="pt-4 border-t border-slate-50 flex justify-between">
                        <div className="h-6 bg-slate-200 rounded w-1/4" />
                        <div className="h-8 bg-slate-200 rounded-full w-1/4" />
                      </div>
                    </div>
                  </div>
                ))
              ) : filteredMenu.length > 0 ? (
                paginatedMenu.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-500"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="relative h-64 overflow-hidden bg-slate-100">
                      <Image
                        src={item.image_url || '/logotakuma.png'}
                        alt={item.name}
                        fill
                        className={cn(
                          "object-cover transition-transform duration-700 group-hover:scale-110",
                          item.stock === 0 && "grayscale opacity-50"
                        )}
                        onLoadingComplete={(img) => {
                          if (img.naturalWidth === 0) {
                            // Can set a local error state if needed
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-tight text-black backdrop-blur">
                          {item.categories?.name || 'Menu'}
                        </span>
                      </div>
                      {item.stock === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="rounded-lg border-2 border-white px-4 py-2 text-sm font-bold tracking-widest text-white">
                            HABIS
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-gold transition-colors">
                          {item.name}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 line-clamp-2">{item.description}</p>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-lg font-bold text-brand-gold">{formatCurrency(item.price)}</span>
                        <Button
                          disabled={item.stock === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem({
                              name: item.name,
                              price: item.price,
                              image: item.image_url,
                              note: ""
                            });
                          }}
                          className={cn(
                            "rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest",
                            item.stock === 0
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-brand-gold text-black shadow-lg hover:shadow-brand-gold/30"
                          )}
                        >
                          {item.stock === 0 ? 'Hbs' : 'Add'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div className="col-span-full py-20 text-center text-slate-400">
                  {loading ? 'Menyiapkan menu...' : 'Menu tidak ditemukan.'}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-4 pt-10">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center text-sm font-medium">
                {currentPage} / {totalPages}
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      <PromoMarquee />
      <Footer />

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute right-6 top-6 z-10 p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-md text-white md:text-black transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="grid md:grid-cols-2">
                <div className="relative h-72 md:h-auto">
                  {selectedItem.image_url && (
                    <Image src={selectedItem.image_url} alt={selectedItem.name} fill className="object-cover" />
                  )}
                  {selectedItem.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-bold tracking-widest border-2 border-white px-6 py-2">HABIS</span>
                    </div>
                  )}
                </div>
                <div className="p-8 flex flex-col">
                  <div className="mb-6">
                    <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">{selectedItem.categories?.name}</span>
                    <h2 className="mt-2 text-3xl font-bold text-slate-900">{selectedItem.name}</h2>
                    <p className="mt-4 text-slate-500 leading-relaxed text-sm">{selectedItem.description}</p>
                  </div>

                  <div className="mt-auto space-y-6">
                    <div className="flex items-center justify-between text-xl font-bold text-slate-900">
                      <span className="text-sm font-medium text-slate-400">Harga</span>
                      <span>{formatCurrency(selectedItem.price)}</span>
                    </div>

                    <Button
                      disabled={selectedItem.stock === 0}
                      onClick={() => {
                        addItem({
                          name: selectedItem.name,
                          price: selectedItem.price,
                          image: selectedItem.image_url,
                          note: ""
                        });
                        setSelectedItem(null);
                      }}
                      className={cn(
                        "w-full py-6 rounded-2xl font-bold tracking-widest uppercase text-sm",
                        selectedItem.stock === 0
                          ? "bg-slate-100 text-slate-400"
                          : "bg-brand-gold text-black shadow-xl"
                      )}
                    >
                      {selectedItem.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
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
