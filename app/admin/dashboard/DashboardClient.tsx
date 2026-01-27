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
  Store,
  TrendingUp,
  Users,
  UtensilsCrossed,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Menu,
  X,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import AdminNotificationDropdown from '@/app/components/AdminNotificationDropdown';

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
  const [orderData, setOrderData] = useState<any[]>([]);
  const [topSelling, setTopSelling] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [period, setPeriod] = useState<'day' | 'month' | 'year'>('month');

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoadingStats(true);
        const res = await fetch(`/api/admin/stats?period=${period}`);
        const data = await res.json();

        if (data.stats) setStats(data.stats);
        if (data.orderData) setOrderData(data.orderData);
        if (data.topSelling) setTopSelling(data.topSelling);
        if (data.recentOrders) setRecentOrders(data.recentOrders);

      } catch (err) {
        console.error('Stats fetch error:', err);
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, [period]);

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

  const statCards = [
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
      label: 'Total Customers',
      value: stats?.customers?.value?.toString() || '0',
      change: stats?.customers?.change || '+0%',
      isPositive: stats?.customers?.isPositive ?? true,
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

  const PIE_COLORS = ['#EFB036', '#1f1a11', '#FF8042', '#0088FE'];

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
                onClick={() => window.print()}
                className="hidden lg:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
              >
                <BarChart3 size={14} />
                Download Laporan
              </button>
              <AdminNotificationDropdown />
              <div ref={profileDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md cursor-pointer w-full"
                >
                  <div className="flex flex-col text-left">
                    <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                    <p className="text-xs text-slate-500">{userEmail}</p>
                  </div>
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

        {/* PRINT ONLY HEADER */}
        <div className="hidden print:flex justify-between items-center border-b-2 border-slate-900 pb-6 mb-6 w-full">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 relative text-black">
              <Image src="/logotakuma.png" alt="Logo" fill className="object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">TakumaEat</h1>
              <p className="text-[10px] font-bold text-[#EFB036] tracking-[0.3em] uppercase">Operational Report • {period}ly Overview</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Generated</p>
            <p className="text-sm font-black text-slate-900">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto bg-slate-50 px-6 py-10 lg:px-10 print:bg-white print:p-0">
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

          {/* Charts Row 1 */}
          {/* Row 1: Statistik Pesanan (Full Width) */}
          <section className="mt-8 grid grid-cols-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">Statistik Penjualan</h2>
                <p className="text-sm text-slate-500">Volume transaksi berdasarkan periode waktu</p>
              </div>
              <div className="mb-6 flex gap-2 print:hidden">
                {[
                  { id: 'day', label: 'Hari Ini' },
                  { id: 'month', label: 'Bulan Ini' },
                  { id: 'year', label: 'Tahun Ini' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPeriod(p.id as any)}
                    className={cn(
                      "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border",
                      period === p.id
                        ? "bg-[#EFB036] text-black border-[#EFB036] shadow-md shadow-[#EFB036]/20"
                        : "bg-white text-slate-400 border-slate-200 hover:border-[#EFB036]/50 hover:text-[#EFB036]"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
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
            </div>
          </section>

          {/* Row 2: Top Selling & Customer Insight (Side by Side) */}
          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Top Selling */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Top Selling Menu</h2>
                  <p className="text-sm text-slate-500">Menu paling laris bulan ini</p>
                </div>
                <Coins className="h-5 w-5 text-[#EFB036]" />
              </div>
              <div className="space-y-4">
                {topSelling.map((menu, index) => (
                  <div
                    key={menu.name}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 transition-all hover:border-[#EFB036]/30 hover:bg-[#EFB036]/5 group"
                  >
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 font-bold text-[#8d5814]">
                      {menu.image ? (
                        <img src={menu.image} alt={menu.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-slate-50 text-slate-300">
                          <UtensilsCrossed size={20} />
                        </div>
                      )}
                      <div className="absolute top-0 left-0 bg-[#EFB036] text-black text-[9px] font-black px-1.5 py-0.5 rounded-br-lg shadow-sm">
                        #{index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{menu.name}</p>
                      <p className="text-[10px] uppercase font-black tracking-widest text-[#EFB036]">{menu.sold} Terjual</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{formatCurrency(menu.revenue)}</p>
                    </div>
                  </div>
                ))}
                {topSelling.length === 0 && <p className="text-center text-slate-500 text-sm py-4 italic">Belum ada data penjualan.</p>}
              </div>
            </div>

            {/* Customer Insight */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-[#EFB036]" />
                  Customer Insight
                </h2>
                <p className="text-sm text-slate-500">Distribusi Tipe Pesanan</p>
              </div>
              <div className="flex-1 min-h-[250px] relative">
                {stats?.distribution ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.distribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400 text-sm">No Data Available</div>
                )}
              </div>
            </div>
          </section>

          {/* Row 3: Recent Orders (Full Width) */}
          <section className="mt-8 grid grid-cols-1">
            {/* Recent Orders */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
                <Link href="/admin/orders" className="text-xs font-bold text-[#EFB036] hover:underline uppercase tracking-wide">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Total</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <p className="font-bold text-xs text-slate-900 uppercase tracking-tighter">{order.id}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{order.time}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-black text-sm text-slate-900">{formatCurrency(order.total)}</p>
                          <span className="text-[10px] uppercase font-black tracking-widest text-[#EFB036]">{order.order_type}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                            order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                order.status === 'on_delivery' ? 'bg-blue-100 text-blue-700' :
                                  order.status === 'ready' ? 'bg-purple-100 text-purple-700' :
                                    order.status === 'preparing' ? 'bg-amber-100 text-amber-700' :
                                      'bg-slate-100 text-slate-700'
                          )}>
                            {order.status === 'completed' ? 'Selesai' :
                              order.status === 'cancelled' ? 'Batal' :
                                order.status === 'preparing' ? 'Proses' :
                                  order.status === 'ready' ? 'Siap' :
                                    order.status === 'on_delivery' ? 'Kirim' :
                                      'Menunggu'
                            }
                          </span>
                        </td>
                      </tr>
                    ))}
                    {recentOrders.length === 0 && (
                      <tr><td colSpan={3} className="p-6 text-center text-slate-500 text-sm">Belum ada order.</td></tr>
                    )}
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
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5cm;
          }
          
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          aside, 
          header,
          .print\:hidden,
          button,
          .mb-6.flex.gap-2,
          .mt-1.text-xs.md\:text-sm.text-slate-600 { 
            display: none !important;
          }

          main {
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .rounded-2xl, .rounded-[32px], article, section, div {
            box-shadow: none !important;
          }

          /* Compact grids for 1-page layout */
          .grid {
             display: grid !important;
             gap: 0.5rem !important;
          }
          
          .sm\:grid-cols-2, .xl\:grid-cols-4 {
             grid-template-columns: repeat(4, 1fr) !important;
          }

          /* Force Statistik and Recent Orders to be Full Width */
          .grid-cols-1 {
             grid-template-columns: 1fr !important;
          }
          
          /* Top Selling & Insight Side-by-side */
          .lg\:grid-cols-2 {
             grid-template-columns: 1.2fr 0.8fr !important;
          }

          /* PREVENT CHART BLEED - CRITICAL */
          .h-\[300px\], .min-h-\[250px\], .recharts-responsive-container { 
             height: 150px !important; 
             min-height: 150px !important;
             max-height: 150px !important;
             overflow: hidden !important; 
          }

          .mt-8 { margin-top: 2rem !important; }
          .p-6, .p-5, .p-4 { padding: 0.4rem !important; }
          
          /* First mt-8 (Statistik) should stay closer to stats cards */
          section.mt-8:first-of-type {
             margin-top: 0.5rem !important;
          }

          /* Adjust font sizes */
          h1 { font-size: 18px !important; }
          h2, h3 { color: black !important; font-size: 11px !important; }
          p, span, td, th { color: #334155 !important; font-size: 9px !important; }
          .text-3xl { font-size: 1.1rem !important; }
          .text-lg { font-size: 0.8rem !important; }
          .text-xs { font-size: 8px !important; }
          
          article, .rounded-2xl {
            break-inside: avoid;
            border: 1px solid #e2e8f0 !important;
          }
        }
      `}</style>
    </div>
  );
}
