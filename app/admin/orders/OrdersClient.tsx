'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Bell,
  LayoutDashboard,
  Megaphone,
  Settings,
  ShoppingCart,
  Store,
  Users,
  UtensilsCrossed,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Clock,
  ChefHat,
  Package,
  Truck,
  Menu,
  CheckCircle2,
  AlertCircle,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface OrdersClientProps {
  displayName: string;
  displayNameInitial: string;
  userEmail: string;
}

export default function OrdersClient({ displayName, displayNameInitial, userEmail }: OrdersClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedOrderType, setSelectedOrderType] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
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

  const statusOptions = ['All', 'Menunggu', 'Diproses', 'Siap', 'Dikirim', 'Selesai', 'Dibatalkan'];

  const refreshOrders = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/admin/orders', window.location.origin);
      if (selectedStatus !== 'All') url.searchParams.set('status', selectedStatus);
      if (selectedOrderType !== 'All') url.searchParams.set('type', selectedOrderType);
      if (searchQuery) url.searchParams.set('search', searchQuery);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshOrders();
  }, [selectedStatus, selectedOrderType, searchQuery]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        await refreshOrders();
        showToast(`Status pesanan berhasil diubah ke ${newStatus}`, 'success');
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev: any) => prev ? { ...prev, status: newStatus } : null);
        }
      } else {
        showToast('Gagal mengubah status pesanan', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan sistem', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredOrders = orders; // Filtering is handled server-side now for search, but let's keep it robust

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Menunggu': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Diproses': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Siap': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'Dikirim': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Selesai': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Dibatalkan': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Menunggu': return <Clock className="h-4 w-4" />;
      case 'Diproses': return <ChefHat className="h-4 w-4" />;
      case 'Siap': return <Package className="h-4 w-4" />;
      case 'Dikirim': return <Truck className="h-4 w-4" />;
      case 'Selesai': return <Check className="h-4 w-4" />;
      case 'Dibatalkan': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white px-6 py-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12"><Image src="/logotakuma.png" alt="Logo" fill className="object-contain" /></div>
          <div><p className="text-xs uppercase tracking-[0.3em] text-slate-500">TakumaEat</p><p className="text-lg font-semibold text-slate-900">Admin Hub</p></div>
        </div>
        <nav className="mt-12 flex-1 space-y-1">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className={cn("flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all", item.href === '/admin/orders' ? 'bg-[#EFB036]/10 text-slate-900' : 'text-slate-600 hover:bg-slate-50')}>
              <item.icon className={cn("h-4 w-4", item.href === '/admin/orders' ? 'text-[#EFB036]' : 'text-[#EFB036]')} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-6 py-5 backdrop-blur lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100"><Menu /></button>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#EFB036]">Orders Management</p>
              <h1 className="mt-1 text-xl lg:text-3xl font-semibold">Kelola Pesanan</h1>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold text-white font-bold">{displayNameInitial}</div>
            <div className="flex flex-col"><p className="text-sm font-bold">{displayName}</p><p className="text-xs text-slate-500">{userEmail}</p></div>
          </div>
        </header>

        <main className="flex-1 bg-slate-50 px-6 py-10 lg:px-10 overflow-y-auto">
          <div className="mb-8 space-y-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input type="text" placeholder="Cari pesanan..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 pl-12 pr-4 text-sm" />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest"><Filter className="h-4 w-4" /> Status:</div>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(opt => (
                  <button key={opt} onClick={() => setSelectedStatus(opt)} className={cn("px-4 py-2 rounded-full text-xs font-bold transition-all", selectedStatus === opt ? "bg-brand-gold text-black shadow-md" : "bg-white border border-slate-200 text-slate-500 hover:border-brand-gold")}>{opt}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Nomor Order</th>
                    <th className="px-6 py-4">Pelanggan</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-6 py-4"><div className="h-12 bg-slate-50 rounded" /></td></tr>)
                  ) : currentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{order.order_number}</div>
                        <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{order.order_type}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700">{order.customer_name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{new Date(order.created_at).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-brand-gold">{formatCurrency(order.total_amount)}</td>
                      <td className="px-6 py-4">
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase", getStatusColor(order.status))}>{order.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => setSelectedOrder(order)} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-brand-gold hover:text-black transition-all"><Eye className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {!loading && currentOrders.length === 0 && (
            <div className="mt-10 flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-slate-200">
              <ShoppingCart className="h-12 w-12 text-slate-200 mb-4" />
              <p className="font-bold text-slate-400">Belum ada pesanan.</p>
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Detail Pesanan</h2>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">{selectedOrder.order_number}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-full hover:bg-slate-50"><X /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Informasi User</p>
                    <p className="font-bold text-slate-900">{selectedOrder.customer_name}</p>
                    <p className="text-sm text-slate-500 mt-1">{selectedOrder.customer_phone}</p>
                    {selectedOrder.address && <p className="text-sm text-slate-500 mt-2 p-3 bg-slate-50 rounded-xl">{selectedOrder.address}</p>}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status Pesanan</p>
                    <select
                      value={selectedOrder.status}
                      onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                      disabled={isSaving}
                      className="w-full h-11 border border-slate-200 rounded-xl px-4 font-bold text-sm bg-slate-50"
                    >
                      {statusOptions.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Item Pesanan</p>
                  <div className="space-y-3">
                    {selectedOrder.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center py-3 border-b border-slate-50">
                        <div>
                          <p className="font-bold text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-brand-gold/10 rounded-2xl border border-brand-gold/20 flex justify-between items-center">
                  <p className="font-bold uppercase text-xs tracking-widest">Total Pembayaran</p>
                  <p className="text-2xl font-bold text-brand-gold">{formatCurrency(selectedOrder.total_amount)}</p>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 flex gap-4">
                <button onClick={() => setSelectedOrder(null)} className="flex-1 h-12 rounded-xl font-bold text-slate-400 hover:bg-slate-50 transition-all">Tutup</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed inset-y-0 left-0 z-[70] w-72 bg-white px-6 py-10 lg:hidden shadow-2xl">
              <div className="flex items-center justify-between mb-10 text-slate-900 font-bold text-lg"><div className="flex items-center gap-3"><Image src="/logotakuma.png" alt="Logo" width={40} height={40} /> Admin Hub</div><button onClick={() => setMobileMenuOpen(false)}><X /></button></div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-bold transition-all", item.href === '/admin/orders' ? 'bg-[#EFB036] text-black shadow-lg shadow-brand-gold/20' : 'text-slate-500 hover:bg-slate-50')}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] min-w-[320px]">
            <div className={cn("flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md", toast.type === 'success' ? "bg-emerald-500/90 text-white border border-emerald-400/20" : "bg-red-500/90 text-white border border-red-400/20")}>
              {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-100" /> : <AlertCircle className="h-5 w-5 shrink-0 text-red-100" />}
              <p className="text-sm font-bold tracking-wide">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
