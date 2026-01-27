'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import type { LucideIcon } from 'lucide-react';
import {
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
  PieChart as PieChartIcon,
  ChevronLeft,
  Search,
  Activity,
  Download,
  Tag
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Sticky Sidebar state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin_sidebar_collapsed');
    if (saved !== null) {
      setIsSidebarCollapsed(saved === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('admin_sidebar_collapsed', String(newState));
  };

  // Stats State
  const [stats, setStats] = useState<any>(null);
  const [orderData, setOrderData] = useState<any[]>([]);
  const [topSelling, setTopSelling] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [period, setPeriod] = useState<'day' | 'month' | 'year' | 'all'>('month');

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

  const handleDownloadReport = () => {
    if (!orderData || orderData.length === 0) return;

    // Create CSV content
    const headers = ['Date', 'Orders'];
    const rows = orderData.map(d => [d.day, d.orders]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `report_takumaeat_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);

  const navItems: { label: string; href: string; icon: LucideIcon }[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Menu', href: '/admin/menu', icon: UtensilsCrossed },
    { label: 'Categories', href: '/admin/categories', icon: Tag },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Promo', href: '/admin/promo', icon: Megaphone },
    { label: 'Branches', href: '/admin/branches', icon: Store },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Settings', href: '/admin/settings', icon: Settings }
  ];

  const statCards = [
    {
      label: 'Total Orders',
      value: stats?.totalOrders?.value?.toString() || '0',
      change: stats?.totalOrders?.change || '0%',
      isPositive: stats?.totalOrders?.isPositive ?? true,
      icon: ShoppingCart,
      color: 'text-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors'
    },
    {
      label: 'Revenue',
      value: formatCurrency(stats?.revenue?.value || 0),
      change: stats?.revenue?.change || '0%',
      isPositive: stats?.revenue?.isPositive ?? true,
      icon: Coins,
      color: 'text-[#EFB036] bg-[#EFB036]/10 hover:bg-[#EFB036]/20 transition-colors'
    },
    {
      label: 'Total Customers',
      value: stats?.customers?.value?.toString() || '0',
      change: stats?.customers?.change || '+0%',
      isPositive: stats?.customers?.isPositive ?? true,
      icon: Users,
      color: 'text-purple-500 bg-purple-50 hover:bg-purple-100 transition-colors'
    },
    {
      label: 'Avg. Order',
      value: formatCurrency(stats?.revenue?.value && stats.totalOrders?.value ? (stats.revenue.value / stats.totalOrders.value) : 0),
      change: 'Steady',
      isPositive: true,
      icon: Activity,
      color: 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100 transition-colors'
    }
  ];

  const PIE_COLORS = ['#EFB036', '#1f1a11', '#FF8042', '#0088FE'];

  if (!stats && loadingStats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#EFB036] border-t-transparent"></div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      {/* Sidebar - Shared Pattern */}
      <aside className={cn(
        "sticky top-0 hidden h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out lg:flex",
        isSidebarCollapsed ? "w-20 px-4" : "w-64 px-6"
      )}>
        <div className={cn("flex py-10 items-center justify-between", isSidebarCollapsed && "justify-center")}>
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0">
              <Image src="/logotakuma.png" alt="Logo" fill className="object-contain" />
            </div>
            {!isSidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden whitespace-nowrap">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EFB036]">Admin Hub</p>
                <p className="text-sm font-black text-slate-900">TakumaEat</p>
              </motion.div>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
          {!isSidebarCollapsed && (
            <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Main Menu</p>
          )}
          {navItems.map((item) => {
            const isActive = item.href === '/admin/dashboard';
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-[1.25rem] py-3.5 transition-all duration-200",
                  isSidebarCollapsed ? "justify-center px-0" : "px-5",
                  isActive ? 'bg-slate-900 text-[#EFB036] shadow-xl' : 'text-slate-500 hover:bg-slate-50'
                )}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? 'text-[#EFB036]' : 'text-slate-400 group-hover:text-slate-900')} />
                {!isSidebarCollapsed && <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-50 pt-6 pb-10">
          <button onClick={toggleSidebar} className="mt-6 flex h-10 w-full items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100">
            <ChevronLeft className={cn("h-4 w-4 transition-transform duration-500", isSidebarCollapsed && "rotate-180")} />
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header - Shared Pattern */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-md lg:px-10">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 rounded-xl bg-slate-50"><Menu /></button>
              <div className="relative max-w-md w-full hidden md:block">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari statistik atau fitur..."
                  className="h-11 w-full rounded-2xl border border-slate-300 bg-slate-50/50 pl-11 pr-4 text-xs font-bold transition-all focus:border-[#EFB036] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#EFB036]/5"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AdminNotificationDropdown />
              <div ref={profileDropdownRef} className="relative">
                <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-1.5 pr-4 transition-all hover:border-[#EFB036]/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#EFB036] to-[#dfa028] text-sm font-black text-white shadow-lg">{displayNameInitial}</div>
                  <div className="hidden lg:block text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 leading-none mb-1">Administrator</p>
                    <p className="text-xs font-black text-slate-900">{displayName}</p>
                  </div>
                </button>
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute right-0 mt-3 w-64 origin-top-right overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-2 shadow-2xl z-50">
                      <div className="px-5 py-5 border-b border-slate-50">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#EFB036] mb-1">Signed in as</p>
                        <p className="text-xs font-black text-slate-900 truncate">{userEmail}</p>
                      </div>
                      <button onClick={handleLogout} className="flex w-full items-center gap-3 px-5 py-4 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50"><LogOut className="h-4 w-4" /><span>Logout System</span></button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/50 px-6 py-10 lg:px-10 no-scrollbar">
          <div className="mb-10 flex flex-col gap-1 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EFB036]">Dashboard Hub</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Selamat Datang, {displayName}!</h1>
              <p className="mt-2 text-sm font-medium text-slate-500">Pantau performa harian TakumaEat Anda secara komprehensif.</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 lg:mt-0">
              <div className="flex gap-2 rounded-2xl bg-white p-1.5 shadow-sm border border-slate-100">
                {(['day', 'month', 'year', 'all'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      period === p
                        ? "bg-slate-900 text-[#EFB036] shadow-lg shadow-slate-900/10"
                        : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    {p === 'day' ? 'Harian' : p === 'month' ? 'Bulanan' : p === 'year' ? 'Tahunan' : 'All Time'}
                  </button>
                ))}
              </div>
              <button onClick={handleDownloadReport} className="flex items-center gap-2 rounded-2xl bg-[#EFB036] px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-xl hover:bg-[#dca332] active:scale-95 transition-all">
                <Download size={16} /> Download
              </button>
            </div>
          </div>

          <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-2xl hover:shadow-black/5"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl transition-colors", card.color)}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-colors",
                    card.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  )}>
                    {card.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {card.change}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{card.label}</p>
                  <p className="mt-2 text-3xl font-black tracking-tight text-slate-900 leading-none">{loadingStats ? '...' : card.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-[3rem] border border-slate-200 bg-white p-10 shadow-sm">
              <div className="mb-8 items-center justify-between flex">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Performa Pesanan</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Estimasi volume pesanan periode ini</p>
                </div>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={orderData}>
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EFB036" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#EFB036" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.8} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="orders" stroke="#EFB036" strokeWidth={4} fillOpacity={1} fill="url(#colorOrders)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[3rem] border border-slate-200 bg-white p-10 shadow-sm flex flex-col">
              <h3 className="text-xl font-black text-slate-900">Distribusi Pesanan</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 mb-8">Porsi delivery vs takeaway</p>
              <div className="h-[250px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.distribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={10}
                      dataKey="value"
                    >
                      {(stats?.distribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-3xl font-black text-slate-900">{stats?.totalOrders?.value || 0}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total</p>
                </div>
              </div>
              <div className="mt-8 space-y-3">
                {(stats?.distribution || []).map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-bold text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1 rounded-[3rem] border border-slate-200 bg-white p-10 shadow-sm flex flex-col">
              <h3 className="text-xl font-black text-slate-900">Top Selling Items</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 mb-6">Menu paling laris terjual</p>
              <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar max-h-[400px]">
                {topSelling.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 font-bold py-10">Belum ada data penjualan</p>
                ) : topSelling.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 rounded-2xl overflow-hidden bg-slate-100">
                      <Image src={item.image || '/placeholder.png'} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">{item.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">{item.sold} Terjual</p>
                    </div>
                    <p className="text-xs font-black text-[#EFB036]">{formatCurrency(item.revenue)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 rounded-[3rem] border border-slate-200 bg-white p-10 shadow-sm">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Pesanan Terbaru</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Pantau transaksi real-time pelanggan</p>
                </div>
                <Link href="/admin/orders" className="text-[10px] font-black uppercase tracking-widest text-[#EFB036] hover:underline">Lihat Semua</Link>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-l-2xl">ID Order</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Pelanggan</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Waktu</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-r-2xl">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentOrders.length === 0 ? (
                      <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No recent orders</td></tr>
                    ) : (
                      recentOrders.map((order, index) => (
                        <tr key={index} className="transition-all hover:bg-slate-50/50 group">
                          <td className="px-6 py-5">
                            <span className="text-xs font-black text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</span>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-xs font-black text-slate-900">{order.customer}</p>
                            <p className="text-[9px] font-black uppercase text-[#EFB036] tracking-widest">{order.order_type}</p>
                          </td>
                          <td className="px-6 py-5 font-bold text-[10px] text-slate-500">{order.time}</td>
                          <td className="px-6 py-5">
                            <span className={cn(
                              "rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest",
                              order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                order.status === 'preparing' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
                            )}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-xs font-black text-slate-900">{formatCurrency(order.total)}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed inset-y-0 left-0 z-[70] w-72 bg-white px-6 py-10 shadow-2xl lg:hidden">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <Image src="/logotakuma.png" alt="Logo" width={40} height={40} className="object-contain" />
                  <p className="text-lg font-black text-slate-900">Admin Hub</p>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl bg-slate-50 text-slate-400"><X size={20} /></button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-4 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-[0.1em]", item.href === '/admin/dashboard' ? 'bg-slate-900 text-[#EFB036]' : 'text-slate-500')}>
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
