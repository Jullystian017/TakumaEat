'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
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
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  CreditCard,
  ChevronDown,
  Eye,
  Filter,
  X,
  Trash2,
  Mail,
  User,
  ArrowRight,
  Info,
  Tag,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import AdminNotificationDropdown from '@/app/components/AdminNotificationDropdown';
import { ConfirmationModal, StatusToast, type ToastType } from '@/app/components/AdminActionUI';

interface OrdersClientProps {
  displayName: string;
  displayNameInitial: string;
  userEmail: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  image_url?: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  payment_status: string;
  payment_method: string;
  order_type: 'delivery' | 'takeaway';
  total_amount: number;
  promo_code?: string;
  discount_amount?: number;
  delivery_address?: any;
  pickup_branch_id?: string;
  schedule_at?: string;
  notes?: string;
  users?: {
    name: string;
    email: string;
  };
}

export default function OrdersClient({ displayName, displayNameInitial, userEmail }: OrdersClientProps) {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Profile Dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Actions state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // UI state (Toast & Modal)
  const [toast, setToast] = useState<{ isOpen: boolean, message: string, type: ToastType }>({
    isOpen: false,
    message: '',
    type: 'success'
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    orderId: string | null;
    title: string;
    message: string;
    type: 'warning' | 'danger';
  }>({
    isOpen: false,
    orderId: null,
    title: '',
    message: '',
    type: 'warning'
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ isOpen: true, message, type });
  };

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

  const statusTabs = [
    { id: 'All', label: 'Semua' },
    { id: 'pending_payment', label: 'Menunggu' },
    { id: 'preparing', label: 'Diproses' },
    { id: 'ready', label: 'Siap' },
    { id: 'on_delivery', label: 'Dikirim' },
    { id: 'completed', label: 'Selesai' },
    { id: 'cancelled', label: 'Batal' }
  ];

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/orders');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      setIsLoadingDetails(true);
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (!res.ok) throw new Error('Failed to fetch details');
      const data = await res.json();
      setOrderItems(data.items || []);
      if (data.order) {
        setSelectedOrder(data.order);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setOrderItems([]);
    setIsDetailOpen(true);
    fetchOrderDetails(order.id);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');

      const data = await res.json();
      const updatedOrder = data.order;

      // Update local state if it's the selected order
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder);
      }

      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      showToast('Status pesanan berhasil diperbarui');
    } catch (error) {
      showToast('Gagal mengupdate status pesanan', 'error');
      console.error(error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePaymentUpdate = async (orderId: string, newPaymentStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: newPaymentStatus })
      });

      if (!res.ok) throw new Error('Failed to update payment status');

      const data = await res.json();
      const updatedOrder = data.order;

      // Update local state
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder);
      }

      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      showToast('Pembayaran berhasil diverifikasi');
    } catch (error) {
      showToast('Gagal memverifikasi pembayaran', 'error');
      console.error(error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const initiateDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      orderId: id,
      title: 'Hapus Pesanan?',
      message: 'Apakah Anda yakin ingin menghapus pesanan ini? Tindakan ini tidak dapat dibatalkan.',
      type: 'danger'
    });
  };

  const handleDeleteOrder = async () => {
    const orderId = confirmModal.orderId;
    if (!orderId) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete');

      setOrders(orders.filter(o => o.id !== orderId));
      if (selectedOrder?.id === orderId) {
        handleCloseDetail();
      }
      showToast('Pesanan berhasil dihapus');
      setConfirmModal({ ...confirmModal, isOpen: false });
    } catch (error) {
      showToast('Gagal menghapus pesanan', 'error');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

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

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === 'All' || order.status === activeTab;
    const searchLower = searchQuery.toLowerCase();
    const idMatch = order.id.toLowerCase().includes(searchLower);
    const nameMatch = order.users?.name?.toLowerCase().includes(searchLower);
    const emailMatch = order.users?.email?.toLowerCase().includes(searchLower);
    return matchesTab && (idMatch || nameMatch || emailMatch);
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed': return { color: 'bg-emerald-100 text-emerald-700', label: 'Selesai' };
      case 'cancelled': return { color: 'bg-red-100 text-red-700', label: 'Dibatalkan' };
      case 'on_delivery': return { color: 'bg-blue-100 text-blue-700', label: 'Dikirim' };
      case 'ready': return { color: 'bg-purple-100 text-purple-700', label: 'Siap' };
      case 'preparing': return { color: 'bg-amber-100 text-amber-700', label: 'Diproses' };
      case 'pending_payment': return { color: 'bg-slate-100 text-slate-700', label: 'Menunggu' };
      default: return { color: 'bg-slate-100 text-slate-700', label: status };
    }
  };

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white px-6 py-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12">
            <Image src="/logotakuma.png" alt="TakumaEat Logo" fill className="object-contain" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">TakumaEat</p>
            <p className="text-lg font-semibold text-slate-900">Admin Hub</p>
          </div>
        </div>
        <nav className="mt-12 flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/admin/orders';
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-[#EFB036]/10 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <item.icon className={`h-4 w-4 transition-colors duration-200 ${isActive ? 'text-[#EFB036]' : 'text-[#EFB036] group-hover:text-[#f6c15d]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-6 py-5 backdrop-blur lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#EFB036]">Orders Management</p>
              <h1 className="mt-2 text-2xl font-semibold md:text-3xl">Daftar Pesanan</h1>
              <p className="mt-2 text-sm text-slate-600">Pantau dan kelola semua pesanan masuk secara real-time.</p>
            </div>
            <div className="flex items-center gap-3">
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 px-6 py-10 lg:px-10">
          {/* Controls */}
          <div className="mb-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Search - At Left */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari ID, Nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs shadow-sm transition-all focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20"
              />
            </div>

            {/* Tabs - Modern UI Shrunk and Inline */}
            <div className="flex overflow-x-auto pb-1 gap-1.5 no-scrollbar">
              {statusTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "whitespace-nowrap rounded-lg px-4 py-2 text-[11px] font-black uppercase tracking-wider transition-all duration-200 border",
                    activeTab === tab.id
                      ? "bg-[#EFB036] text-black border-[#EFB036] shadow-md shadow-[#EFB036]/10"
                      : "bg-white text-slate-500 border-slate-200 hover:border-[#EFB036] hover:text-[#EFB036]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-20 text-center text-slate-400 flex flex-col items-center gap-4">
                <div className="h-10 w-10 border-4 border-[#EFB036] border-t-transparent rounded-full animate-spin" />
                <span>Memuat data pesanan...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">ID & Waktu</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Pelanggan</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Tipe & Metode</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Total</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentOrders.length === 0 ? (
                      <tr><td colSpan={6} className="p-20 text-center text-slate-500">Tidak ada pesanan ditemukan.</td></tr>
                    ) : (
                      currentOrders.map((order) => {
                        const status = getStatusInfo(order.status);
                        return (
                          <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4">
                              <p className="font-mono text-sm font-bold text-slate-900 group-hover:text-[#EFB036]">#{order.id.slice(0, 8).toUpperCase()}</p>
                              <p className="mt-1 text-[11px] text-slate-500">{formatDate(order.created_at)}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                  <User size={14} />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-slate-900">{order.users?.name || 'Guest User'}</p>
                                  <p className="text-[10px] text-slate-500">{order.users?.email || '-'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5">
                                  {order.order_type === 'delivery' ?
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded"><MapPin size={10} /> Delivery</span> :
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded"><Store size={10} /> Takeaway</span>
                                  }
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <CreditCard size={12} className="text-slate-400" />
                                  <span className="text-[10px] font-bold uppercase text-slate-500">{order.payment_method}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-slate-900">{formatCurrency(order.total_amount)}</p>
                              <p className={cn("text-[10px] font-bold uppercase", order.payment_status === 'paid' ? 'text-emerald-600' : 'text-slate-400')}>{order.payment_status}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold", status.color)}>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenDetail(order)}
                                  className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-[#EFB036] hover:text-black transition-all"
                                  title="Detail Pesanan"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={() => initiateDelete(order.id)}
                                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                                  title="Hapus Pesanan"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {!isLoading && filteredOrders.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
              <div className="text-xs text-slate-500 font-medium">
                Menampilkan <span className="font-bold text-slate-900">{indexOfFirstOrder + 1}</span> - <span className="font-bold text-slate-900">{Math.min(indexOfLastOrder, filteredOrders.length)}</span> dari <span className="font-bold text-slate-900">{filteredOrders.length}</span> pesanan
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all border",
                      currentPage === page
                        ? "bg-[#EFB036] border-[#EFB036] text-black shadow-md shadow-[#EFB036]/10"
                        : "bg-white border-slate-200 text-slate-600 hover:border-[#EFB036] hover:text-[#EFB036]"
                    )}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
                >
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Detail Modal - Enhanced */}
      <AnimatePresence>
        {isDetailOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-6 bg-slate-50/50 flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#EFB036]/10 flex items-center justify-center text-[#EFB036]">
                    <ShoppingCart size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-slate-900">Pesanan #{selectedOrder.id.slice(0, 8).toUpperCase()}</h2>
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase", getStatusInfo(selectedOrder.status).color)}>
                        {getStatusInfo(selectedOrder.status).label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 font-medium">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                </div>
                <button onClick={handleCloseDetail} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 transition-all shadow-sm">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid gap-6 lg:grid-cols-5">
                  {/* Items Section */}
                  <div className="lg:col-span-3 space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><UtensilsCrossed size={16} className="text-[#EFB036]" /> Item Pesanan</h3>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">{orderItems.length} ITEM</span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {isLoadingDetails ? (
                          <div className="p-10 text-center text-slate-400 flex flex-col items-center gap-3">
                            <div className="h-6 w-6 border-2 border-[#EFB036] border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs font-medium">Memuat item...</span>
                          </div>
                        ) : orderItems.length === 0 ? (
                          <div className="p-10 text-center text-slate-400 text-sm">Tidak ada item.</div>
                        ) : orderItems.map(item => (
                          <div key={item.id} className="p-4 flex gap-4 hover:bg-slate-50/80 transition-colors">
                            <div className="h-14 w-14 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 font-bold text-[#8d5814]">
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-400">
                                  <UtensilsCrossed size={18} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{item.quantity}x @ {formatCurrency(item.price)}</p>
                                </div>
                                <p className="font-bold text-slate-900 text-sm flex-shrink-0">{formatCurrency(item.price * item.quantity)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Payment Summary */}
                      <div className="bg-slate-900 p-6 text-white space-y-3">
                        {!!selectedOrder.discount_amount && (
                          <div className="flex justify-between text-xs font-bold text-red-400">
                            <span className="flex items-center gap-1.5"><Tag size={14} /> Diskon ({selectedOrder.promo_code})</span>
                            <span>- {formatCurrency(selectedOrder.discount_amount)}</span>
                          </div>
                        )}
                        <div className="pt-3 border-t border-slate-800 flex justify-between items-end">
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Pembayaran</p>
                            <h4 className="text-2xl font-black text-[#EFB036] leading-none">{formatCurrency(selectedOrder.total_amount)}</h4>
                          </div>
                          <div className="text-right">
                            <p className="font-bold flex items-center gap-1.5 text-xs"><CreditCard size={12} className="text-[#EFB036]" /> {selectedOrder.payment_method.toUpperCase()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Info Section */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><MapPin size={16} className="text-[#EFB036]" /> Lokasi & Waktu</h3>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-3">{selectedOrder.order_type === 'delivery' ? 'Alamat Pengiriman' : 'Informasi Pengambilan'}</p>
                        {selectedOrder.order_type === 'delivery' ? (
                          <div className="space-y-2">
                            <p className="text-sm font-bold text-slate-900 leading-tight">{selectedOrder.delivery_address?.fullName}</p>
                            <p className="text-xs text-slate-500">{selectedOrder.delivery_address?.phone}</p>
                            <div className="flex gap-2 items-start text-[11px] text-slate-600">
                              <MapPin size={14} className="text-[#EFB036] flex-shrink-0 mt-0.5" />
                              <p className="leading-relaxed">{selectedOrder.delivery_address?.addressLine}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex gap-2 items-center text-sm font-bold text-slate-900">
                              <Store size={16} className="text-[#EFB036]" />
                              <p>Cabang ID: {selectedOrder.pickup_branch_id}</p>
                            </div>
                            <div className="flex gap-2 items-center text-xs text-slate-600 font-bold">
                              <Clock size={16} className="text-[#EFB036]" />
                              <p>{selectedOrder.schedule_at ? formatDate(selectedOrder.schedule_at) : 'ASAP (SEGERA)'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Notes */}
                    {selectedOrder.notes && (
                      <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5 space-y-3">
                        <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2"><Info size={16} className="text-amber-500" /> Catatan Pesanan</h3>
                        <p className="text-xs text-amber-800 leading-relaxed font-medium bg-white/50 p-3 rounded-xl border border-amber-100/50">
                          {selectedOrder.notes}
                        </p>
                      </div>
                    )}

                    {/* Status Update Card */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200">
                      <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2"><ArrowRight size={16} className="text-[#EFB036]" /> Status & Pembayaran</h3>

                      {selectedOrder.payment_method === 'cod' && selectedOrder.payment_status !== 'paid' && (
                        <button
                          onClick={() => handlePaymentUpdate(selectedOrder.id, 'paid')}
                          disabled={isUpdatingStatus}
                          className="w-full mb-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all border border-emerald-500/50"
                        >
                          <CheckCircle size={18} />
                          VERIFIKASI PEMBAYARAN TUNAI
                        </button>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        {statusTabs.filter(t => t.id !== 'All').map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => handleStatusUpdate(selectedOrder.id, tab.id)}
                            disabled={isUpdatingStatus || selectedOrder.status === tab.id}
                            className={cn(
                              "text-left px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
                              selectedOrder.status === tab.id
                                ? "bg-[#EFB036] text-black border-[#EFB036] shadow-md shadow-[#EFB036]/10"
                                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-600"
                            )}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-100 p-6 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
                <button
                  onClick={() => initiateDelete(selectedOrder.id)}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                  Hapus Pesanan
                </button>
                <button
                  onClick={handleCloseDetail}
                  className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Action UI Overlay */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleDeleteOrder}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        isLoading={isDeleting}
        confirmLabel="Ya, Hapus"
      />

      <AnimatePresence>
        {toast.isOpen && (
          <StatusToast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, isOpen: false })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
