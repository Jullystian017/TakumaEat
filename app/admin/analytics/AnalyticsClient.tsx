'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, Bell, LayoutDashboard, Megaphone, Settings, ShoppingCart, Store, Users, UtensilsCrossed, TrendingUp, DollarSign, Package, Clock, Star, Download, FileText, ChevronDown } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsClientProps {
  displayName: string;
  displayNameInitial: string;
  userEmail: string;
}

export default function AnalyticsClient({ displayName, displayNameInitial, userEmail }: AnalyticsClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  }

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

  // Sample analytics data
  const stats = [
    { label: 'Total Revenue', value: 125000000, change: 12.5, isPositive: true, icon: DollarSign, color: 'emerald' },
    { label: 'Total Orders', value: 1245, change: 8.3, isPositive: true, icon: ShoppingCart, color: 'blue' },
    { label: 'Total Customers', value: 892, change: -2.1, isPositive: false, icon: Users, color: 'purple' },
    { label: 'Best Seller', value: 456, change: 15.2, isPositive: true, icon: TrendingUp, color: 'orange', subtitle: 'Signature Ramen' },
    { label: 'Avg. Order Time', value: 18, change: -5.3, isPositive: true, icon: Clock, color: 'cyan', suffix: ' min' },
    { label: 'Customer Rating', value: 4.8, change: 2.1, isPositive: true, icon: Star, color: 'yellow', suffix: '/5.0' }
  ];

  // Sales data for line chart (7 days)
  const salesData = [
    { date: '20 Okt', revenue: 15000000 },
    { date: '21 Okt', revenue: 18000000 },
    { date: '22 Okt', revenue: 16500000 },
    { date: '23 Okt', revenue: 22000000 },
    { date: '24 Okt', revenue: 19500000 },
    { date: '25 Okt', revenue: 25000000 },
    { date: '26 Okt', revenue: 21000000 }
  ];

  // Top selling menu
  const topSellingMenu = [
    { menu: 'Signature Ramen', sold: 456, revenue: 29640000, rating: 4.9, contribution: 92 },
    { menu: 'Takoyaki Supreme', sold: 389, revenue: 17505000, rating: 4.8, contribution: 78 },
    { menu: 'Sushi Platter', sold: 312, revenue: 26520000, rating: 4.7, contribution: 85 },
    { menu: 'Bento Box Deluxe', sold: 278, revenue: 15290000, rating: 4.6, contribution: 70 },
    { menu: 'Matcha Ice Cream', sold: 234, revenue: 8190000, rating: 4.9, contribution: 65 }
  ];

  // Customer insights data
  const customerTypeData = [
    { name: 'Pelanggan Baru', value: 35, color: '#EFB036' },
    { name: 'Pelanggan Lama', value: 65, color: '#000000' }
  ];

  const orderTypeData = [
    { name: 'Delivery', value: 58, color: '#EFB036' },
    { name: 'Takeaway', value: 42, color: '#64748b' }
  ];

  // Branch performance
  const branchPerformance = [
    { branch: 'Jakarta Pusat', orders: 1245, revenue: 125000000, rating: 4.9, performance: 'excellent' },
    { branch: 'Bali', orders: 1123, revenue: 112000000, rating: 4.8, performance: 'excellent' },
    { branch: 'Jakarta Selatan', orders: 987, revenue: 98000000, rating: 4.7, performance: 'good' },
    { branch: 'Surabaya', orders: 892, revenue: 89000000, rating: 4.6, performance: 'good' },
    { branch: 'Bandung', orders: 756, revenue: 75000000, rating: 4.5, performance: 'average' }
  ];

  // Realtime orders
  const realtimeOrders = [
    { orderId: '#ORD-2024-156', menu: 'Signature Ramen', status: 'Diproses', time: '2 menit lalu' },
    { orderId: '#ORD-2024-155', menu: 'Sushi Platter', status: 'Siap', time: '5 menit lalu' },
    { orderId: '#ORD-2024-154', menu: 'Takoyaki Supreme', status: 'Dikirim', time: '8 menit lalu' },
    { orderId: '#ORD-2024-153', menu: 'Bento Box', status: 'Selesai', time: '12 menit lalu' },
    { orderId: '#ORD-2024-152', menu: 'Matcha Ice Cream', status: 'Selesai', time: '15 menit lalu' }
  ];

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'bg-emerald-100 text-emerald-700';
      case 'good': return 'bg-blue-100 text-blue-700';
      case 'average': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Diproses': return 'bg-purple-100 text-purple-700';
      case 'Siap': return 'bg-cyan-100 text-cyan-700';
      case 'Dikirim': return 'bg-indigo-100 text-indigo-700';
      case 'Selesai': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const handleExport = (type: 'csv' | 'pdf') => {
    alert(`Exporting data as ${type.toUpperCase()}...`);
  };

  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white px-6 py-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12"><Image src="/logotakuma.png" alt="Logo" fill className="object-contain" /></div>
          <div><p className="text-xs uppercase tracking-[0.3em] text-slate-500">TakumaEat</p><p className="text-lg font-semibold">Admin Hub</p></div>
        </div>
        <nav className="mt-12 flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/admin/analytics';
            return (<Link key={item.label} href={item.href} className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${isActive ? 'bg-[#EFB036]/10 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}>
              <item.icon className={`h-4 w-4 ${isActive ? 'text-[#EFB036]' : 'text-[#EFB036]'}`} /><span>{item.label}</span>
            </Link>);
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-6 py-5 backdrop-blur lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#EFB036]">Analytics & Reports</p>
              <h1 className="mt-2 text-2xl font-semibold md:text-3xl">Analytics Dashboard</h1>
              <p className="mt-2 text-sm text-slate-600">Monitor performa bisnis dan tren penjualan.</p>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm"><Bell className="h-5 w-5" /></button>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#EFB036] to-[#d89a28] text-sm font-bold text-white">{displayNameInitial}</div>
                <div><p className="text-sm font-semibold">{displayName}</p><p className="text-xs text-slate-500">{userEmail}</p></div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 px-6 py-10 lg:px-10">
          {/* Filter Bar */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-600">Periode:</span>
              <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value as any)} className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20">
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="year">Tahun Ini</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleExport('csv')} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><FileText className="h-4 w-4" />CSV</button>
              <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 rounded-lg bg-[#EFB036] px-4 py-2 text-sm font-medium text-black hover:bg-[#dfa028]"><Download className="h-4 w-4" />PDF</button>
            </div>
          </div>

          {/* Stats Cards - 6 cards in 2 rows */}
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const colorClasses = {
                emerald: 'bg-emerald-100 text-emerald-600',
                blue: 'bg-blue-100 text-blue-600',
                purple: 'bg-purple-100 text-purple-600',
                orange: 'bg-orange-100 text-orange-600',
                cyan: 'bg-cyan-100 text-cyan-600',
                yellow: 'bg-yellow-100 text-yellow-600'
              }[stat.color];
              return (
                <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses}`}><Icon className="h-6 w-6" /></div>
                    <div className={`text-sm font-semibold ${stat.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>{stat.isPositive ? '↗' : '↘'} {Math.abs(stat.change)}%</div>
                  </div>
                  <p className="mt-4 text-sm text-slate-600">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{stat.label === 'Total Revenue' ? formatCurrency(stat.value) : stat.value.toLocaleString()}{stat.suffix || ''}</p>
                  {stat.subtitle && <p className="mt-1 text-xs text-slate-500">{stat.subtitle}</p>}
                </div>
              );
            })}
          </div>

          {/* Sales Overview Chart */}
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold text-slate-900">Sales Overview</h2>
              <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="h-10 w-full sm:w-48 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium focus:border-[#EFB036] focus:outline-none">
                <option value="all">Semua Cabang</option>
                <option value="jakarta-pusat">Jakarta Pusat</option>
                <option value="bali">Bali</option>
                <option value="jakarta-selatan">Jakarta Selatan</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip formatter={(value: any) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#EFB036" strokeWidth={3} name="Revenue" dot={{ fill: '#EFB036', r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Selling Menu Table */}
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-slate-900">Top Selling Menu</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Menu</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Jumlah Terjual</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Pendapatan</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Rating</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">Kontribusi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {topSellingMenu.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-4 py-4 font-semibold text-slate-900">{item.menu}</td>
                      <td className="px-4 py-4 text-slate-600">{item.sold}</td>
                      <td className="px-4 py-4 font-semibold text-[#EFB036]">{formatCurrency(item.revenue)}</td>
                      <td className="px-4 py-4"><div className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span className="font-semibold">{item.rating}</span></div></td>
                      <td className="px-4 py-4"><div className="flex items-center gap-2"><div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-[#EFB036]" style={{ width: `${item.contribution}%` }} /></div><span className="text-sm font-medium text-slate-600">{item.contribution}%</span></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Insights & Branch Performance */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            {/* Customer Insights */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-bold text-slate-900">Customer Insights</h2>
              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-sm font-medium text-slate-600">Tipe Pelanggan</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={customerTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={(entry) => `${entry.value}%`}>
                        {customerTypeData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <p className="mb-3 text-sm font-medium text-slate-600">Tipe Pesanan</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={orderTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={(entry) => `${entry.value}%`}>
                        {orderTypeData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Branch Performance */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-bold text-slate-900">Branch Performance</h2>
              <div className="space-y-4">
                {branchPerformance.map((branch, index) => (
                  <div key={index} className="rounded-xl border border-slate-200 p-4 hover:border-[#EFB036]/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-slate-900">{branch.branch}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getPerformanceBadge(branch.performance)}`}>{branch.performance}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div><p className="text-slate-500">Orders</p><p className="font-semibold text-slate-900">{branch.orders}</p></div>
                      <div><p className="text-slate-500">Revenue</p><p className="font-semibold text-[#EFB036]">{formatCurrency(branch.revenue)}</p></div>
                      <div><p className="text-slate-500">Rating</p><p className="font-semibold text-slate-900"><Star className="inline h-3 w-3 fill-yellow-400 text-yellow-400" /> {branch.rating}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Realtime Order Tracker */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Realtime Order Tracker</h2>
              <Clock className="h-5 w-5 text-[#EFB036]" />
            </div>
            <div className="space-y-3">
              {realtimeOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:border-[#EFB036]/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{order.orderId}</p>
                    <p className="text-sm text-slate-600">{order.menu}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>{order.status}</span>
                    <p className="text-xs text-slate-500 w-24 text-right">{order.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
