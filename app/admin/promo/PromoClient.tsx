'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
  Plus,
  Trash2,
  Edit,
  X,
  Clock,
  LogOut,
  ChevronLeft,
  ChevronDown,
  Menu,
  Tag,
  Calendar,
  Percent,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import AdminNotificationDropdown from '@/app/components/AdminNotificationDropdown';
import { ConfirmationModal, StatusToast, type ToastType } from '@/app/components/AdminActionUI';

interface Promo {
  id: string;
  code: string;
  name?: string;
  description?: string;
  discount_type: 'Percentage' | 'Fixed';
  discount_value: number;
  min_purchase: number;
  max_discount?: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  usage_limit?: number;
  usage_count?: number;
}

interface PromoClientProps {
  displayName: string;
  displayNameInitial: string;
  userEmail: string;
  promos?: Promo[];
}

export default function PromoClient({ displayName, displayNameInitial, userEmail, promos: initialPromos = [] }: PromoClientProps) {
  const [promos, setPromos] = useState<Promo[]>(initialPromos);
  const [isLoading, setIsLoading] = useState(initialPromos.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

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

  // Toast & Modal State
  const [toast, setToast] = useState<{ isOpen: boolean, message: string, type: ToastType }>({
    isOpen: false,
    message: '',
    type: 'success'
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    promoId: string | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    promoId: null,
    title: '',
    message: ''
  });

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ isOpen: true, message, type });
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount).replace('Rp', 'Rp');
  };

  const fetchPromos = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/promos');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPromos(data.promos || []);
    } catch (e) {
      showToast('Gagal memuat data promo', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialPromos.length === 0) fetchPromos();
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

  const handleDeletePromo = (id: string, code: string) => {
    setConfirmModal({
      isOpen: true,
      promoId: id,
      title: 'Hapus Promo',
      message: `Hapus kode promo ${code}? Tindakan ini permanen.`
    });
  };

  const confirmDelete = async () => {
    if (!confirmModal.promoId) return;
    try {
      const res = await fetch(`/api/admin/promos?id=${confirmModal.promoId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setPromos(promos.filter(p => p.id !== confirmModal.promoId));
      showToast('Promo berhasil dihapus');
    } catch (e) {
      showToast('Gagal menghapus promo', 'error');
    } finally {
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  // Promo Form Modal State
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [promoForm, setPromoForm] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'Percentage' as 'Percentage' | 'Fixed',
    discount_value: 0,
    min_purchase: 0,
    max_discount: 0,
    start_date: '',
    end_date: '',
    usage_limit: 0,
    is_active: true
  });

  const openAddPromo = () => {
    setEditingPromo(null);
    setPromoForm({
      code: '',
      name: '',
      description: '',
      discount_type: 'Percentage',
      discount_value: 0,
      min_purchase: 0,
      max_discount: 0,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usage_limit: 0,
      is_active: true
    });
    setIsPromoModalOpen(true);
  };

  const openEditPromo = (promo: Promo) => {
    setEditingPromo(promo);
    setPromoForm({
      code: promo.code,
      name: promo.name || '',
      description: promo.description || '',
      discount_type: (promo.discount_type.charAt(0).toUpperCase() + promo.discount_type.slice(1).toLowerCase()) as 'Percentage' | 'Fixed',
      discount_value: promo.discount_value,
      min_purchase: promo.min_purchase,
      max_discount: promo.max_discount || 0,
      start_date: promo.start_date ? promo.start_date.split('T')[0] : '',
      end_date: promo.end_date ? promo.end_date.split('T')[0] : '',
      usage_limit: promo.usage_limit || 0,
      is_active: promo.is_active
    });
    setIsPromoModalOpen(true);
  };

  const handleSubmitPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const url = '/api/admin/promos';
      const method = editingPromo ? 'PUT' : 'POST';
      const body = editingPromo ? { ...promoForm, id: editingPromo.id } : promoForm;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error();

      showToast(editingPromo ? 'Promo diperbarui' : 'Promo ditambahkan');
      fetchPromos();
      setIsPromoModalOpen(false);
    } catch (err) {
      showToast('Gagal menyimpan promo', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPromos = promos.filter(p =>
    p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            const isActive = item.href === '/admin/promo';
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
                  placeholder="Cari kode promo..."
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
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EFB036]">Marketing</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Manajemen Promo</h1>
              <p className="mt-2 text-sm font-medium text-slate-500">Kelola kupon diskon dan penawaran spesial TakumaEat.</p>
            </div>
            <button
              onClick={openAddPromo}
              className="mt-6 flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-[#EFB036] shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95 lg:mt-0"
            >
              <Plus size={16} /> Tambah Promo Baru
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Processing promo data...</div>
            ) : filteredPromos.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active promos found</div>
            ) : filteredPromos.map((promo) => (
              <motion.div
                key={promo.id}
                layout
                className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                <div className="relative p-6 flex-1">
                  <div className="flex items-start justify-between mb-5">
                    <div className="h-12 w-12 rounded-xl bg-[#EFB036]/10 flex items-center justify-center text-[#EFB036] shadow-inner">
                      <Tag size={22} strokeWidth={2.5} />
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-[8.5px] font-black uppercase tracking-widest",
                      promo.is_active ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                    )}>
                      {promo.is_active ? (
                        <>
                          <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                          Aktif
                        </>
                      ) : (
                        'Nonaktif'
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-[#EFB036] transition-colors truncate pr-4">
                        {promo.code}
                      </h3>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-tight line-clamp-1">
                      {promo.name || 'Campaign Promo'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <div className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-900 text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                        {promo.discount_type === 'Percentage' ? `${promo.discount_value}% OFF` : `-${formatCurrency(promo.discount_value)}`}
                      </div>
                      {promo.usage_limit && promo.usage_limit > 0 && (
                        <div className="px-2.5 py-1 rounded-lg bg-[#EFB036]/10 text-[#EFB036] text-[10px] font-bold uppercase tracking-widest border border-[#EFB036]/20">
                          {promo.usage_count || 0}/{promo.usage_limit} Pakai
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative mt-auto border-t border-dashed border-slate-200 bg-slate-50/50 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <Calendar size={13} className="text-[#EFB036]" />
                    <span>{promo.end_date ? new Date(promo.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Lifetime'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditPromo(promo)}
                      className="p-2.5 rounded-xl bg-slate-900 text-[#EFB036] hover:scale-110 transition-all active:scale-95 shadow-md"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeletePromo(promo.id, promo.code)}
                      className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95 border border-red-100/50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Corner Decorative circles */}
                <div className="absolute left-0 top-1/2 -ml-3 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-slate-50/50" />
                <div className="absolute right-0 top-1/2 -mr-3 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-slate-50/50" />
              </motion.div>
            ))}
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
                  <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-4 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-[0.1em]", item.href === '/admin/promo' ? 'bg-slate-900 text-[#EFB036]' : 'text-slate-500')}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <ConfirmationModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} onConfirm={confirmDelete} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} type="danger" />
      <AnimatePresence>{toast.isOpen && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, isOpen: false })} />}</AnimatePresence>

      {/* Promo Form Modal */}
      <AnimatePresence>
        {isPromoModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPromoModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[3rem] bg-white shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EFB036]">Promo Engine</p>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">{editingPromo ? 'Edit Kode Promo' : 'Tambah Promo Baru'}</h2>
                </div>
                <button onClick={() => setIsPromoModalOpen(false)} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmitPromo} className="flex-1 overflow-y-auto p-8 no-scrollbar bg-slate-50/30">
                <div className="grid gap-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Kode Promo</label>
                      <input
                        required
                        value={promoForm.code}
                        onChange={e => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold focus:border-[#EFB036] focus:outline-none focus:ring-4 focus:ring-[#EFB036]/5"
                        placeholder="CONTOH: HEMAT50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Internal Name</label>
                      <input
                        required
                        value={promoForm.name}
                        onChange={e => setPromoForm({ ...promoForm, name: e.target.value })}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold focus:border-[#EFB036] focus:outline-none focus:ring-4 focus:ring-[#EFB036]/5"
                        placeholder="Nama kampanye promo"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Deskripsi</label>
                    <textarea
                      value={promoForm.description}
                      onChange={e => setPromoForm({ ...promoForm, description: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold focus:border-[#EFB036] focus:outline-none focus:ring-4 focus:ring-[#EFB036]/5 min-h-[100px]"
                      placeholder="Detail promo untuk pelanggan..."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Tipe Diskon</label>
                      <select
                        value={promoForm.discount_type}
                        onChange={e => setPromoForm({ ...promoForm, discount_type: e.target.value as any })}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-bold focus:border-[#EFB036] focus:outline-none"
                      >
                        <option value="Percentage">Persentase (%)</option>
                        <option value="Fixed">Potongan Harga (Rp)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nilai Diskon</label>
                      <input
                        type="number"
                        required
                        value={promoForm.discount_value}
                        onChange={e => setPromoForm({ ...promoForm, discount_value: parseInt(e.target.value) || 0 })}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold focus:border-[#EFB036] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Min. Beli (Rp)</label>
                      <input
                        type="number"
                        value={promoForm.min_purchase}
                        onChange={e => setPromoForm({ ...promoForm, min_purchase: parseInt(e.target.value) || 0 })}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold focus:border-[#EFB036] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Maks. Diskon (Rp)</label>
                      <input
                        type="number"
                        value={promoForm.max_discount}
                        onChange={e => setPromoForm({ ...promoForm, max_discount: parseInt(e.target.value) || 0 })}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold focus:border-[#EFB036] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Limit Pakai</label>
                      <input
                        type="number"
                        value={promoForm.usage_limit}
                        onChange={e => setPromoForm({ ...promoForm, usage_limit: parseInt(e.target.value) || 0 })}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold focus:border-[#EFB036] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Tgl Mulai</label>
                      <input
                        type="date"
                        value={promoForm.start_date}
                        onChange={e => setPromoForm({ ...promoForm, start_date: e.target.value })}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold focus:border-[#EFB036] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Tgl Berakhir</label>
                      <input
                        type="date"
                        value={promoForm.end_date}
                        onChange={e => setPromoForm({ ...promoForm, end_date: e.target.value })}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold focus:border-[#EFB036] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-white">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={promoForm.is_active}
                      onChange={e => setPromoForm({ ...promoForm, is_active: e.target.checked })}
                      className="h-5 w-5 rounded border-slate-300 text-[#EFB036] focus:ring-[#EFB036]"
                    />
                    <label htmlFor="is_active" className="text-xs font-black uppercase tracking-widest text-slate-700">Promo Aktif & Bisa Digunakan</label>
                  </div>
                </div>
              </form>

              <div className="p-8 border-t border-slate-100 bg-white sticky bottom-0 shrink-0">
                <button
                  onClick={handleSubmitPromo}
                  disabled={isSubmitting || !promoForm.code || !promoForm.name || promoForm.discount_value <= 0}
                  className="w-full h-14 rounded-2xl bg-slate-900 text-[#EFB036] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'MEMPROSES...' : (editingPromo ? 'SIMPAN PERUBAHAN' : 'TERBITKAN PROMO')}
                </button>
                {(!promoForm.code || !promoForm.name || promoForm.discount_value <= 0) && (
                  <p className="text-[9px] font-bold text-red-400 mt-3 text-center uppercase tracking-widest">Lengkapi Kode, Nama, dan Nilai Diskon</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
