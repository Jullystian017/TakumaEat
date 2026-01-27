'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import type { LucideIcon } from 'lucide-react';
import {
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
  ChevronLeft,
  Eye,
  Filter,
  X,
  Trash2,
  Mail,
  User,
  ArrowRight,
  Info,
  Tag,
  LogOut,
  Menu,
  Printer,
  Package,
  Truck,
  ShoppingBag,
  Banknote
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import AdminNotificationDropdown from '@/app/components/AdminNotificationDropdown';
import { ConfirmationModal, StatusToast, type ToastType } from '@/app/components/AdminActionUI';

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  order_type: string;
  payment_method: string;
  payment_status: string;
  delivery_address: any;
  created_at: string;
  notes?: string;
  promo_code?: string;
  discount_amount?: number;
  users: {
    name: string;
    email: string;
  };
  order_items: any[];
}

interface OrdersClientProps {
  displayName: string;
  displayNameInitial: string;
  userEmail: string;
}

export default function OrdersClient({ displayName, displayNameInitial, userEmail }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Toast & Modal State
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
    type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    orderId: null,
    title: '',
    message: '',
    type: 'warning'
  });

  // Sidebar persistence
  useEffect(() => {
    const saved = localStorage.getItem('admin_sidebar_collapsed');
    if (saved !== null) setIsSidebarCollapsed(saved === 'true');
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('admin_sidebar_collapsed', String(newState));
  };

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ isOpen: true, message, type });
  }, []);

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

  const statusTabs = [
    { id: 'All', label: 'Semua' },
    { id: 'pending_payment', label: 'Menunggu' },
    { id: 'preparing', label: 'Diproses' },
    { id: 'on_delivery', label: 'Dikirim' },
    { id: 'completed', label: 'Selesai' },
    { id: 'cancelled', label: 'Batal' }
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'Menunggu';
      case 'preparing': return 'Diproses';
      case 'ready': return 'Siap';
      case 'on_delivery': return 'Dikirim';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Batal';
      default: return status;
    }
  };

  const formatOrderDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}.${minutes}`;
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/orders');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
      showToast('Gagal memuat data pesanan', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
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

  const fetchOrderDetails = async (orderId: string) => {
    try {
      setIsLoadingDetails(true);
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (!res.ok) throw new Error('Failed to fetch details');
      const data = await res.json();
      setOrderItems(data.items || []);
    } catch (error) {
      console.error(error);
      showToast('Gagal memuat detail pesanan', 'error');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
    fetchOrderDetails(order.id);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      showToast(`Status diperbarui ke ${newStatus.toUpperCase()}`);
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      showToast('Gagal memperbarui status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    setConfirmModal({
      isOpen: true,
      orderId,
      title: 'Hapus Pesanan',
      message: 'Hapus data pesanan ini secara permanen?',
      type: 'danger'
    });
  };

  const confirmDelete = async () => {
    const id = confirmModal.orderId;
    if (!id) return;
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setOrders(orders.filter(o => o.id !== id));
      showToast('Pesanan berhasil dihapus');
      if (selectedOrder?.id === id) setIsDetailOpen(false);
    } catch (e) {
      showToast('Gagal menghapus pesanan', 'error');
    } finally {
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.users?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.users?.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' || order.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

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
            const isActive = item.href === '/admin/orders';
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
                  placeholder="Cari pesanan, pelanggan, atau menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EFB036]">Transactions</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Manajemen Pesanan</h1>
              <p className="mt-2 text-sm font-medium text-slate-500">Kelola dan pantau seluruh status pesanan masuk TakumaEat.</p>
            </div>
          </div>

          <div className="mb-10 flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-2xl px-6 py-3.5 text-xs font-black uppercase tracking-widest transition-all",
                  activeTab === tab.id ? "bg-slate-900 text-[#EFB036] shadow-xl" : "bg-white border border-slate-200 text-slate-500"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-l-2xl">ID & Waktu</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Pelanggan</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Tipe & Metode</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Total</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-r-2xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading transactions...</td></tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No orders found</td></tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="transition-all hover:bg-slate-50/50 group">
                        <td className="px-6 py-5">
                          <p className="text-xs font-black text-slate-900 leading-none mb-1">#{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{formatOrderDateTime(order.created_at)}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs font-black text-slate-900 leading-none mb-1">{order.users?.name}</p>
                          <p className="text-[10px] font-medium text-slate-400 truncate max-w-[150px]">{order.users?.email}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1.5">
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest w-fit px-2 py-1 rounded-lg flex items-center gap-1.5",
                              order.order_type === 'delivery' ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-purple-50 text-purple-600 border border-purple-100"
                            )}>
                              {order.order_type === 'delivery' ? <Truck size={10} /> : <ShoppingBag size={10} />}
                              {order.order_type}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter flex items-center gap-1.5 pl-1.5">
                              {order.payment_method.toLowerCase().includes('cod') ? <Banknote size={10} className="text-slate-400" /> : <CreditCard size={10} className="text-slate-400" />}
                              {order.payment_method}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs font-black text-slate-900 leading-none mb-2">{formatCurrency(order.total_amount)}</p>
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest",
                            order.payment_status === 'paid' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                          )}>
                            {order.payment_status === 'paid' ? 'PAID' : 'UNPAID'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest flex items-center gap-2",
                              order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                  order.status === 'on_delivery' ? 'bg-blue-50 text-blue-600' :
                                    order.status === 'preparing' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                            )}>
                              <div className={cn("h-1.5 w-1.5 rounded-full",
                                order.status === 'completed' ? 'bg-emerald-500' :
                                  order.status === 'cancelled' ? 'bg-red-500' :
                                    order.status === 'on_delivery' ? 'bg-blue-500' :
                                      order.status === 'preparing' ? 'bg-amber-500' : 'bg-slate-400'
                              )} />
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openOrderDetails(order)} className="p-2.5 rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-[#EFB036] transition-all"><Eye size={16} /></button>
                            <button onClick={() => handleDeleteOrder(order.id)} className="p-2.5 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
                  <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-4 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-[0.1em]", item.href === '/admin/orders' ? 'bg-slate-900 text-[#EFB036]' : 'text-slate-500')}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {isDetailOpen && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDetailOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden rounded-[3rem] bg-slate-50 flex flex-col shadow-[0_32px_64px_rgba(0,0,0,0.1)] border border-white"
            >
              {/* Receipt Header Style */}
              <div className="p-8 flex items-start justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-100">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-[1.5rem] bg-amber-50 border border-amber-100 flex items-center justify-center text-[#EFB036] shadow-sm">
                    <ShoppingBag size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pesanan #{selectedOrder.id.slice(0, 8).toUpperCase()}</h2>
                      <span className={cn(
                        "rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest",
                        selectedOrder.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                          selectedOrder.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                            selectedOrder.status === 'on_delivery' ? 'bg-blue-50 text-blue-600' :
                              selectedOrder.status === 'preparing' ? 'bg-amber-50 text-amber-600' :
                                selectedOrder.status === 'pending_payment' ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-500'
                      )}>
                        {getStatusLabel(selectedOrder.status)}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{formatOrderDateTime(selectedOrder.created_at)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm active:scale-95"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-slate-50/30">
                <div className="grid gap-8">
                  {/* Special Instructions (MOVED TO TOP) */}
                  {selectedOrder.notes && (
                    <div className="px-8 py-6 rounded-[2rem] bg-amber-50 border-2 border-amber-200/50 flex items-center gap-4 shadow-sm">
                      <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-amber-500 shrink-0 shadow-sm border border-amber-100">
                        <Info size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-0.5">Catatan Penting Pelanggan</p>
                        <p className="text-sm font-black text-slate-900 leading-tight italic">"{selectedOrder.notes}"</p>
                      </div>
                    </div>
                  )}

                  {/* Identity & Address Section */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identitas Pelanggan</p>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">{selectedOrder.users?.name}</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1">{selectedOrder.users?.email}</p>
                      </div>
                    </div>

                    {selectedOrder.order_type === 'delivery' ? (
                      <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <MapPin size={12} className="text-[#EFB036]" /> Alamat Pengiriman
                        </p>
                        <div className="space-y-1">
                          <p className="text-sm font-black text-slate-900">{selectedOrder.delivery_address?.fullName || selectedOrder.users?.name}</p>
                          <p className="text-xs font-bold text-slate-500 italic leading-relaxed">
                            {selectedOrder.delivery_address?.addressLine || selectedOrder.delivery_address?.address || 'N/A'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Store size={12} className="text-[#EFB036]" /> Pickup Branch
                        </p>
                        <p className="text-sm font-black text-slate-900">Ambil di Toko</p>
                      </div>
                    )}
                  </div>

                  {/* Receipt Section */}
                  <div className="overflow-hidden rounded-[3rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 flex flex-col">
                    <div className="p-8 bg-white border-b border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-[#EFB036]">
                          <UtensilsCrossed size={18} />
                        </div>
                        <h3 className="text-base font-black text-slate-900">Item Pesanan</h3>
                      </div>
                      <span className="bg-slate-100 px-4 py-1.5 rounded-full text-[10px] font-black text-slate-500 tracking-widest uppercase">
                        {orderItems.length} ITEM
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      {isLoadingDetails ? (
                        <div className="space-y-4 p-5">
                          {[1, 2].map(i => <div key={i} className="h-20 bg-slate-50 rounded-3xl animate-pulse" />)}
                        </div>
                      ) : orderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-white transition-all hover:bg-slate-50 group border border-transparent hover:border-slate-100">
                          <div className="flex items-center gap-5">
                            <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-slate-100 border border-slate-100 shrink-0">
                              {item.image_url ? (
                                <Image src={item.image_url} alt={item.name} fill className="object-cover transition-transform group-hover:scale-110" />
                              ) : (
                                <UtensilsCrossed className="absolute inset-0 m-auto text-slate-300" size={24} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-black text-slate-900 leading-tight group-hover:text-[#EFB036] transition-colors">{item.name}</p>
                                {item.note && (
                                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100/50">
                                    {item.note}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {item.quantity}x @ {formatCurrency(item.price)}
                              </p>
                            </div>
                          </div>
                          <p className="text-base font-black text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>

                    {/* Dark Detailed Footer */}
                    <div className="bg-[#0f172a] p-10 text-white relative overflow-hidden mt-auto">
                      <div className="absolute right-0 top-0 h-full w-1/4 bg-white/5 skew-x-12 translate-x-1/2 pointer-events-none" />

                      <div className="space-y-6 relative z-10">
                        {/* Discount row if applicable */}
                        {selectedOrder.promo_code && (selectedOrder as any).discount_amount > 0 && (
                          <div className="flex justify-between items-center text-slate-400">
                            <div className="flex items-center gap-2">
                              <Tag size={14} className="text-[#EFB036]" />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Diskon ({selectedOrder.promo_code})</span>
                            </div>
                            <span className="text-sm font-black text-red-400">-{formatCurrency((selectedOrder as any).discount_amount)}</span>
                          </div>
                        )}

                        <div className="h-px bg-white/10" />

                        <div className="flex justify-between items-end">
                          <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Total Pembayaran</p>
                            <h4 className="text-4xl font-black text-[#EFB036] tracking-tighter italic">
                              {formatCurrency(selectedOrder.total_amount)}
                            </h4>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/5">
                              {selectedOrder.payment_method.toLowerCase().includes('cod') ? <Banknote size={16} className="text-[#EFB036]" /> : <CreditCard size={16} className="text-[#EFB036]" />}
                              <span className="text-[10px] font-black uppercase tracking-widest">{selectedOrder.payment_method}</span>
                            </div>
                            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500">Transaction Secured</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update Actions - Bottom Bar */}
              <div className="p-8 border-t border-slate-100 bg-white sticky bottom-0 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Update Progres Alur Kerja</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Live Update Mode</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { id: 'pending_payment', label: 'Menunggu', icon: Clock },
                    { id: 'preparing', label: 'Diproses', icon: Clock },
                    { id: 'on_delivery', label: 'Dikirim', icon: Truck },
                    { id: 'completed', label: 'Selesai', icon: Package }
                  ].map(st => (
                    <button
                      key={st.id}
                      disabled={isUpdatingStatus || selectedOrder.status === st.id}
                      onClick={() => handleUpdateStatus(selectedOrder.id, st.id)}
                      className={cn(
                        "group relative flex items-center justify-center gap-3 py-4 rounded-2xl border transition-all active:scale-95 overflow-hidden",
                        selectedOrder.status === st.id
                          ? "bg-slate-900 border-slate-900 text-[#EFB036] shadow-xl"
                          : "bg-white border-slate-200 text-slate-400 hover:border-[#EFB036] hover:text-slate-900 shadow-sm"
                      )}
                    >
                      {selectedOrder.status === st.id && (
                        <div className="absolute top-0 right-0 p-1.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#EFB036]" />
                        </div>
                      )}
                      <st.icon size={16} className={cn("transition-transform group-hover:scale-110", selectedOrder.status === st.id ? "text-[#EFB036]" : "text-slate-300 group-hover:text-[#EFB036]")} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmDelete}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        type={confirmModal.type}
      />
      <AnimatePresence>
        {toast.isOpen && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, isOpen: false })} />}
      </AnimatePresence>
    </div>
  );
}
