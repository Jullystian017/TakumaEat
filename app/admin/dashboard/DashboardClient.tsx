'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Bell,
  Coins,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Settings,
  ShoppingCart,
  Star,
  Store,
  TrendingUp,
  Users,
  UtensilsCrossed,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Tag,
  Menu,
  X
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DashboardClientProps {
  displayName: string;
  displayNameInitial: string;
  userEmail: string;
}

export default function DashboardClient({ displayName, displayNameInitial, userEmail }: DashboardClientProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Stats State
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoadingStats(true);
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data.stats) setStats(data.stats);
      } catch (err) {
        console.error('Stats fetch error:', err);
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const navItems: { label: string; href: string; icon: LucideIcon }[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Menu', href: '/admin/menu', icon: UtensilsCrossed },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Promo', href: '/admin/promo', icon: Megaphone },
    { label: 'Branches', href: '/admin/branches', icon: Store },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/admin/settings', icon: Settings }
  ];

  const statCards: { label: string; value: string; change: string; isPositive: boolean; icon: LucideIcon }[] = [
    {
      label: 'Total Orders',
      value: stats?.totalOrders?.value?.toString() || '0',
      change: stats?.totalOrders?.change || '0%',
      isPositive: stats?.totalOrders?.isPositive ?? true,
      icon: ShoppingCart
    },
    {
      label: 'Revenue',
      value: formatCurrency(stats?.revenue?.value || 0),
      change: stats?.revenue?.change || '0%',
      isPositive: stats?.revenue?.isPositive ?? true,
      icon: Coins
    },
    {
      label: 'New Customers',
      value: stats?.newCustomers?.value?.toString() || '0',
      change: stats?.newCustomers?.change || '0%',
      isPositive: stats?.newCustomers?.isPositive ?? true,
      icon: Users
    },
    {
      label: 'Rata-rata Order',
      value: formatCurrency(stats?.revenue?.value ? stats.revenue.value / (stats.totalOrders?.value || 1) : 0),
      change: '0%',
      isPositive: true,
      icon: TrendingUp
    }
  ];

  const orderData = [
    { day: 'Sen', orders: 145 },
    { day: 'Sel', orders: 168 },
    { day: 'Rab', orders: 154 },
    { day: 'Kam', orders: 176 },
    { day: 'Jum', orders: 212 },
    { day: 'Sab', orders: 234 },
    { day: 'Min', orders: 198 }
  ];

  const recentOrders: { id: string; customer: string; items: string; total: number; status: string; time: string }[] = [
    { id: '#ORD-1284', customer: 'Budi Santoso', items: 'Takoyaki Supreme, Ramen', total: 185_000, status: 'Completed', time: '10 min ago' },
    { id: '#ORD-1283', customer: 'Siti Aminah', items: 'Sushi Set, Green Tea', total: 245_000, status: 'Processing', time: '15 min ago' },
    { id: '#ORD-1282', customer: 'Ahmad Rizki', items: 'Bento Box', total: 125_000, status: 'Completed', time: '22 min ago' },
    { id: '#ORD-1281', customer: 'Dewi Lestari', items: 'Ramen, Gyoza', total: 165_000, status: 'Pending', time: '28 min ago' },
    { id: '#ORD-1280', customer: 'Eko Prasetyo', items: 'Takoyaki, Ocha', total: 95_000, status: 'Completed', time: '35 min ago' }
  ];

  const topSellingMenu: { name: string; category: string; sold: number; revenue: number; image: string }[] = [
    { name: 'Takoyaki Supreme', category: 'Appetizer', sold: 342, revenue: 51_300_000, image: '/menu/takoyaki.jpg' },
    { name: 'Signature Ramen', category: 'Main Course', sold: 298, revenue: 44_700_000, image: '/menu/ramen.jpg' },
    { name: 'Sushi Platter', category: 'Main Course', sold: 256, revenue: 51_200_000, image: '/menu/sushi.jpg' },
    { name: 'Bento Box', category: 'Main Course', sold: 234, revenue: 29_250_000, image: '/menu/bento.jpg' }
  ];

  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white px-6 py-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12">
            <Image
              src="/logotakuma.png"
              alt="TakumaEat Logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">TakumaEat</p>
            <p className="text-lg font-semibold text-slate-900">Admin Hub</p>
          </div>
        </div>
        <nav className="mt-12 flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/admin/dashboard';
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${isActive
                  ? 'bg-[#EFB036]/10 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <item.icon
                  className={`h-4 w-4 transition-colors duration-200 ${isActive ? 'text-[#EFB036]' : 'text-[#EFB036] group-hover:text-[#f6c15d]'
                    }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Laporan Bulanan</p>
          <p className="mt-2 text-xs text-slate-600">Pantau laporan rinci untuk menjaga ritme pertumbuhan setiap cabang.</p>
          <button className="mt-4 h-9 w-full rounded-full bg-[#EFB036] px-4 text-xs font-semibold text-black hover:bg-[#dfa028]">
            Unduh PDF
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-6 py-5 backdrop-blur lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3 lg:hidden mb-2">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 -ml-2 rounded-lg hover:bg-slate-100"
                >
                  <Menu className="h-6 w-6 text-slate-600" />
                </button>
                <p className="text-xs uppercase tracking-[0.3em] text-[#EFB036]">Dashboard Admin</p>
              </div>
              <p className="hidden lg:block text-xs uppercase tracking-[0.3em] text-[#EFB036]">Dashboard Admin</p>
              <h1 className="mt-1 text-xl font-semibold md:text-3xl">Selamat datang, {displayName}</h1>
              <p className="mt-1 text-xs md:text-sm text-slate-600">
                Monitor performa operasional TakumaEat secara real-time.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:shadow"
              >
                <Bell className="h-5 w-5" />
              </button>
              <div ref={profileDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md cursor-pointer w-full"
                >
                  {/* Nama dan email di kiri */}
                  <div className="flex flex-col text-left">
                    <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                    <p className="text-xs text-slate-500">{userEmail}</p>
                  </div>

                  {/* Inisial di kanan */}
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#EFB036] to-[#d89a28] text-sm font-bold text-white shadow-md">
                    {displayNameInitial}
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg z-50">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 px-6 py-10 lg:px-10">
          {/* Summary Cards */}
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <article
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div className="flex flex-col">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFB036]/10">
                    <card.icon className="h-6 w-6 text-[#EFB036]" />
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{card.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">{card.value}</p>
                    <div className="mt-2 flex items-center gap-1">
                      {card.isPositive ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-semibold ${card.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {card.change}
                      </span>
                      <span className="text-xs text-slate-500">vs last month</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* Charts and Tables */}
          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Daily Orders Chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">Daily Orders</h2>
                <p className="text-sm text-slate-500">Order volume for the last 7 days</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={orderData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line type="monotone" dataKey="orders" stroke="#EFB036" strokeWidth={3} dot={{ fill: '#EFB036', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top Selling Menu */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Top Selling Menu</h2>
                  <p className="text-sm text-slate-500">Best performing items this month</p>
                </div>
                <Star className="h-5 w-5 text-[#EFB036]" />
              </div>
              <div className="space-y-4">
                {topSellingMenu.map((menu, index) => (
                  <div
                    key={menu.name}
                    className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-[#EFB036]/30 hover:bg-[#EFB036]/5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFB036]/10 text-sm font-bold text-[#EFB036]">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{menu.name}</p>
                      <p className="text-xs text-slate-500">{menu.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#EFB036]">{menu.sold} sold</p>
                      <p className="text-xs text-slate-500">{formatCurrency(menu.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Recent Orders Table */}
          <section className="mt-8">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
                    <p className="text-sm text-slate-500">Latest customer orders and their status</p>
                  </div>
                  <Link
                    href="/admin/orders"
                    className="text-sm font-semibold text-[#EFB036] transition-colors hover:text-[#d89a28]"
                  >
                    View All →
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Items
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">{order.id}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">{order.customer}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600">{order.items}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">{formatCurrency(order.total)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${order.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : order.status === 'Processing'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                              }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Clock className="h-4 w-4" />
                            {order.time}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[70] w-72 bg-white px-6 py-10 lg:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3 text-slate-900">
                  <div className="relative h-10 w-10"><Image src="/logotakuma.png" alt="Logo" fill className="object-contain" /></div>
                  <p className="text-lg font-bold">Admin Hub</p>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full bg-slate-50 text-slate-400 hover:text-red-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-bold transition-all",
                      item.href === '/admin/dashboard' ? 'bg-[#EFB036] text-black shadow-lg shadow-[#EFB036]/20' : 'text-slate-500 hover:bg-slate-50'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
