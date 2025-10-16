'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import {
  BellRing,
  ChevronDown,
  ClipboardList,
  LogIn,
  LogOut,
  Minus,
  Plus,
  Settings2,
  ShoppingCart,
  Trash2,
  UserPlus,
  UserRound,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCart } from '@/app/context/CartContext';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/promo', label: 'Promo' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
];

type DashboardLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const dashboardLinks: DashboardLink[] = [
  { href: '/orders', label: 'My Orders', icon: ClipboardList },
  { href: '/notifications', label: 'Notifications', icon: BellRing },
  { href: '/settings', label: 'Settings', icon: Settings2 }
];

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0
});

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopDashboardOpen, setDesktopDashboardOpen] = useState(false);
  const [mobileDashboardOpen, setMobileDashboardOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const dashboardDesktopRef = useRef<HTMLDivElement | null>(null);
  const dashboardMobileRef = useRef<HTMLDivElement | null>(null);
  const cartMobileRef = useRef<HTMLDivElement | null>(null);
  const cartDesktopDrawerRef = useRef<HTMLDivElement | null>(null);
  const cartDesktopTriggerRef = useRef<HTMLButtonElement | null>(null);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isTransparent = isHome && !scrolled;
  const isAuthenticated = !!session?.user;
  const anyDashboardOpen = desktopDashboardOpen || mobileDashboardOpen;
  const { cartItems, cartItemCount, cartSubtotal, incrementItem, decrementItem, removeItem } = useCart();

  const isLinkActive = (href: string) => {
    if (!pathname) {
      return false;
    }

    if (href === '/') {
      return pathname === '/';
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);
  const closeDashboardMenu = () => {
    setDesktopDashboardOpen(false);
    setMobileDashboardOpen(false);
  };
  const closeCart = () => setCartOpen(false);
  const ensureAuthenticated = () => {
    if (isAuthenticated) {
      return true;
    }

    const callbackUrl = pathname ?? '/';
    router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);

    return false;
  };
  const toggleDesktopDashboard = () =>
    setDesktopDashboardOpen((prev) => {
      if (!ensureAuthenticated()) {
        return prev;
      }

      const next = !prev;
      if (next) {
        setMobileDashboardOpen(false);
        closeCart();
      }
      return next;
    });
  const toggleMobileDashboard = () =>
    setMobileDashboardOpen((prev) => {
      if (!ensureAuthenticated()) {
        return prev;
      }

      const next = !prev;
      if (next) {
        setDesktopDashboardOpen(false);
        closeCart();
      }
      return next;
    });
  const toggleCart = () =>
    setCartOpen((prev) => {
      if (!ensureAuthenticated()) {
        return prev;
      }

      const next = !prev;
      if (next) {
        closeDashboardMenu();
      }
      return next;
    });
  const handleLogout = () => {
    closeDashboardMenu();
    signOut();
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
        closeDashboardMenu();
        closeCart();
      }
    };

    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      closeDashboardMenu();
      closeCart();
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInDashboardMenu =
        (dashboardDesktopRef.current && dashboardDesktopRef.current.contains(target)) ||
        (dashboardMobileRef.current && dashboardMobileRef.current.contains(target));

      if (!isInDashboardMenu) {
        closeDashboardMenu();
      }

      const isInCartArea =
        (cartMobileRef.current && cartMobileRef.current.contains(target)) ||
        (cartDesktopDrawerRef.current && cartDesktopDrawerRef.current.contains(target)) ||
        (cartDesktopTriggerRef.current && cartDesktopTriggerRef.current.contains(target));

      if (!isInCartArea) {
        closeCart();
      }
    };

    if (anyDashboardOpen || cartOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [anyDashboardOpen, cartOpen]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCartOpen(false);
      setDesktopDashboardOpen(false);
      setMobileDashboardOpen(false);
    }
  }, [isAuthenticated]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          'relative transition-all duration-500',
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-[0_12px_30px_rgba(15,23,42,0.08)]'
            : 'bg-transparent'
        )}
      >
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-500',
            scrolled ? 'opacity-90' : 'opacity-0'
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,176,54,0.08),transparent_55%)]" />
        </div>
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 h-px bg-black/10 transition-opacity duration-500',
            scrolled ? 'opacity-100' : 'opacity-0'
          )}
        />
        <nav
          className={cn(
            'relative flex h-20 w-full items-center gap-4 px-8 sm:px-14 lg:px-20',
            isTransparent ? 'text-white' : 'text-black'
          )}
        >
          <div className="hidden flex-1 items-center lg:flex">
            <ul className="flex items-center gap-9 text-sm font-medium tracking-[0.08em]">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'group relative py-2 transition-colors duration-500',
                      isLinkActive(link.href)
                        ? 'text-brand-gold'
                        : isTransparent
                          ? 'text-white/80 hover:text-brand-gold'
                          : 'text-black/70 hover:text-brand-gold'
                    )}
                    scroll={false}
                  >
                    {link.label}
                    <span
                      className={cn(
                        'absolute -bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-brand-gold transition-transform duration-500',
                        isLinkActive(link.href) && 'scale-x-100',
                        !isLinkActive(link.href) && 'group-hover:scale-x-100'
                      )}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-1 items-center justify-start lg:justify-center">
            <Link
              href="/"
              className="flex items-center gap-3 transition-transform duration-400 hover:scale-105"
              scroll={false}
            >
              <span
                className={cn(
                  'text-2xl font-semibold transition-colors duration-400',
                  isTransparent ? 'text-transparent drop-shadow-[0_12px_32px_rgba(239,176,54,0.28)]' : 'text-brand-gold'
                )}
              >
                {isTransparent ? (
                  <span className="bg-gradient-to-r from-brand-gold via-amber-200 to-brand-gold bg-clip-text">
                    TakumaEat
                  </span>
                ) : (
                  <span className="bg-gradient-to-r from-amber-500 via-brand-gold to-amber-600 bg-clip-text text-transparent">
                    TakumaEat
                  </span>
                )}
              </span>
            </Link>
          </div>

          <div
            className={cn(
              'hidden flex-1 items-center justify-end gap-4 lg:flex',
              isTransparent ? 'text-white' : 'text-black'
            )}
          >
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  {cartItemCount > 0 && (
                    <Badge className="absolute -right-2 -top-2 hidden rounded-full border-none bg-black px-2 py-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gold shadow-[0_10px_24px_rgba(15,23,42,0.16)] lg:block z-20">
                      {cartItemCount}
                    </Badge>
                  )}
                  <Button
                    type="button"
                    onClick={toggleCart}
                    ref={cartDesktopTriggerRef}
                    className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-gold via-amber-200 to-brand-gold px-6 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-black shadow-[0_20px_42px_rgba(239,176,54,0.38)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_54px_rgba(239,176,54,0.46)] relative"
                  >
                    <ShoppingCart className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    <span>Order</span>
                  </Button>
                </div>
                <div ref={dashboardDesktopRef} className="relative">
                  <Button
                    type="button"
                    onClick={toggleDesktopDashboard}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold uppercase tracking-[0.08em] transition-all duration-300 hover:-translate-y-0.5',
                      isTransparent
                        ? 'border-white/40 bg-white/10 text-white hover:border-white/60 hover:bg-white/20'
                        : 'border-black/20 bg-white text-black hover:border-brand-gold/50 hover:text-black'
                    )}
                  >
                    <UserRound className="h-4 w-4" />
                    <span>Dashboard</span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform duration-300',
                        desktopDashboardOpen && 'rotate-180'
                      )}
                    />
                  </Button>
                  <AnimatePresence>
                    {desktopDashboardOpen && (
                      <motion.div
                        key="dashboard-desktop-dropdown"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute right-0 mt-3 w-56 origin-top-right overflow-hidden rounded-3xl border border-black/5 bg-white/95 text-left shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur"
                      >
                        <ul className="divide-y divide-black/5 text-sm text-black">
                          {dashboardLinks.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                onClick={closeDashboardMenu}
                                className="flex items-center gap-3 px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.24em] transition-colors duration-200 hover:bg-black/5"
                              >
                                <link.icon className="h-4 w-4" />
                                <span>{link.label}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <div className="h-px bg-black/5" />
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.24em] text-brand-gold transition-colors duration-200 hover:bg-black/5"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-gold via-amber-200 to-brand-gold px-6 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-black shadow-[0_20px_42px_rgba(239,176,54,0.38)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_54px_rgba(239,176,54,0.46)]"
                >
                  <Link href="/login">
                    <LogIn className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    <span>Login</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  className="group inline-flex items-center gap-2 rounded-full border border-black/20 bg-white px-6 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-black transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-gold/50 hover:text-black"
                >
                  <Link href="/register">
                    <UserPlus className="h-4 w-4" />
                    <span>Register</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <div ref={cartMobileRef} className="relative">
              <button
                type="button"
                onClick={toggleCart}
                aria-haspopup="dialog"
                aria-expanded={cartOpen}
                className={cn(
                  'relative flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50',
                  isTransparent
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-black/5 text-black hover:bg-black/10',
                  cartOpen && 'text-brand-gold'
                )}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 border-none bg-brand-gold px-2 py-0 text-[10px] text-black shadow-[0_8px_18px_rgba(239,176,54,0.4)] z-20">
                    {cartItemCount}
                  </Badge>
                )}
              </button>

            </div>

            <div ref={dashboardMobileRef} className="relative">
              <button
                type="button"
                onClick={toggleMobileDashboard}
                aria-haspopup="menu"
                aria-expanded={mobileDashboardOpen}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50',
                  isTransparent
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-black/5 text-black hover:bg-black/10',
                  mobileDashboardOpen && 'text-brand-gold'
                )}
              >
                <UserRound className="h-5 w-5" />
              </button>
              <AnimatePresence>
                {mobileDashboardOpen && (
                  <motion.div
                    key="dashboard-mobile-dropdown"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute right-0 top-14 w-56 origin-top-right overflow-hidden rounded-3xl border border-black/5 bg-white/95 text-left shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur"
                  >
                    <ul className="divide-y divide-black/5 text-sm text-black">
                      {dashboardLinks.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            onClick={closeDashboardMenu}
                            className="flex items-center gap-3 px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.24em] transition-colors duration-200 hover:bg-black/5"
                          >
                            <link.icon className="h-4 w-4" />
                            <span>{link.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="h-px bg-black/5" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.24em] text-brand-gold transition-colors duration-200 hover:bg-black/5"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={toggleMenu}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50',
                isTransparent && !menuOpen ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/5 text-black hover:bg-black/10',
                menuOpen && 'text-brand-gold'
              )}
            >
              <span className="relative flex h-6 w-7 flex-col justify-center">
                <span
                  className={cn(
                    'absolute left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full transition-all duration-300',
                    menuOpen
                      ? 'translate-y-0 rotate-45 bg-current'
                      : '-translate-y-2 rotate-0',
                    !menuOpen && isTransparent ? 'bg-white' : !menuOpen ? 'bg-gradient-to-r from-black/70 via-black to-black/70' : ''
                  )}
                />
                <span
                  className={cn(
                    'absolute left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full transition-all duration-300',
                    menuOpen ? 'opacity-0' : 'opacity-100',
                    isTransparent ? 'bg-white' : 'bg-gradient-to-r from-black/70 via-black to-black/70'
                  )}
                />
                <span
                  className={cn(
                    'absolute left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full transition-all duration-300',
                    menuOpen
                      ? 'translate-y-0 -rotate-45 bg-current'
                      : 'translate-y-2 rotate-0',
                    !menuOpen && isTransparent ? 'bg-white' : !menuOpen ? 'bg-gradient-to-r from-black/70 via-black to-black/70' : ''
                  )}
                />
              </span>
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={closeMenu}
            />
            <motion.div
              key="panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.35 }}
              className="fixed inset-y-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm overflow-y-auto rounded-3xl border border-white/20 bg-white/95 p-8 text-black shadow-[0_24px_50px_rgba(15,23,42,0.12)] backdrop-blur"
              role="dialog"
              aria-modal="true"
              id="mobile-navigation"
            >
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeMenu}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/80 text-black shadow-sm transition-all duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ul className="mt-6 flex flex-col gap-6 text-sm tracking-[0.18em]">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      className={cn(
                        'block rounded-xl border px-2 py-2 transition-all duration-300',
                        isLinkActive(link.href)
                          ? 'border-brand-gold/60 bg-brand-gold/15 text-black'
                          : 'border-transparent text-black/70 hover:border-brand-gold/40 hover:bg-brand-gold/10 hover:text-black'
                      )}
                      scroll={false}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-10 space-y-4">
                <div className="space-y-2">
                  {!isAuthenticated && (
                    <>
                      <Button
                        asChild
                        className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-gold via-amber-200 to-brand-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-black shadow-[0_22px_50px_rgba(239,176,54,0.42)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_56px_rgba(239,176,54,0.5)]"
                      >
                        <Link href="/login">
                          <LogIn className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                          <span>Login</span>
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white/90 px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-black transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-gold/50 hover:bg-white"
                      >
                        <Link href="/register" onClick={closeMenu}>
                          <UserPlus className="h-4 w-4" />
                          <span>Register</span>
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              key="desktop-cart-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={closeCart}
            />
            <motion.aside
              key="desktop-cart-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.35 }}
              className="fixed inset-0 z-50 flex w-full max-w-full flex-col overflow-hidden bg-white/95 shadow-[0_34px_60px_rgba(15,23,42,0.18)] backdrop-blur sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:max-w-sm sm:border-l sm:border-black/5 lg:max-w-md"
              ref={cartDesktopDrawerRef}
            >
              <div className="flex items-center justify-between border-b border-black/5 px-8 py-6 text-black">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/60">Keranjang</p>
                  <p className="text-2xl font-semibold text-black">Pesanan Anda</p>
                </div>
                <button
                  type="button"
                  onClick={closeCart}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-sm transition-all duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50"
                  aria-label="Tutup keranjang"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-8 py-6 text-black">
                <div className="space-y-4">
                  {cartItems.length === 0 ? (
                    <div className="flex h-48 items-center justify-center rounded-[28px] border border-dashed border-black/10 bg-white/80 text-center text-sm font-semibold uppercase tracking-[0.24em] text-black/50">
                      Keranjang kosong
                    </div>
                  ) : (
                    cartItems.map((item) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.24, ease: 'easeOut' }}
                        className="flex gap-5 rounded-[28px] border border-black/5 bg-white/92 p-4 shadow-[0_18px_42px_rgba(15,23,42,0.12)]"
                      >
                        <div className="relative h-20 w-20 overflow-hidden rounded-2xl">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="space-y-0.5">
                            <p className="text-base font-semibold text-black">{item.name}</p>
                            <p className="text-sm font-semibold text-brand-gold">{currencyFormatter.format(item.price)}</p>
                          </div>
                          <div className="flex items-center justify-between text-sm font-semibold text-black/70">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => decrementItem(item.name)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-black transition-colors duration-200 hover:border-brand-gold/60 hover:text-brand-gold"
                                aria-label={`Kurangi ${item.name}`}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-8 text-center text-base font-semibold text-black">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => incrementItem(item.name)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-black transition-colors duration-200 hover:border-brand-gold/60 hover:text-brand-gold"
                                aria-label={`Tambah ${item.name}`}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.name)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/90 text-black transition-colors duration-200 hover:border-brand-gold/60 hover:text-brand-gold"
                              aria-label={`Hapus ${item.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
              <div className="space-y-5 border-t border-black/5 px-8 py-6 text-black">
                <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-[0.22em]">
                  <span>Subtotal</span>
                  <span className="text-base text-brand-gold">{currencyFormatter.format(cartSubtotal)}</span>
                </div>
                <Button
                  className="w-full rounded-full bg-brand-gold px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black shadow-[0_28px_60px_rgba(239,176,54,0.45)] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={cartItems.length === 0}
                  onClick={() => {
                    setCartOpen(false);
                    router.push('/checkout/start');
                  }}
                >
                  Checkout Sekarang
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
