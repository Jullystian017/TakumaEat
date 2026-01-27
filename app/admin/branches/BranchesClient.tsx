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
  MapPin,
  Phone,
  Clock3,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import AdminNotificationDropdown from '@/app/components/AdminNotificationDropdown';
import { ConfirmationModal, StatusToast, type ToastType } from '@/app/components/AdminActionUI';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  operation_hours?: string;
  is_active: boolean;
}

interface BranchesClientProps {
  displayName: string;
  displayNameInitial: string;
  userEmail: string;
  branches?: Branch[];
}

export default function BranchesClient({ displayName, displayNameInitial, userEmail, branches: initialBranches = [] }: BranchesClientProps) {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [isLoading, setIsLoading] = useState(initialBranches.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);

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

  const [toast, setToast] = useState<{ isOpen: boolean, message: string, type: ToastType }>({
    isOpen: false,
    message: '',
    type: 'success'
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    branchId: string | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    branchId: null,
    title: '',
    message: ''
  });

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ isOpen: true, message, type });
  }, []);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/branches');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBranches(data.branches || []);
    } catch (e) {
      showToast('Gagal memuat data cabang', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialBranches.length === 0) fetchBranches();
  }, []);

  // Branch Form Modal State
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchForm, setBranchForm] = useState({
    name: '',
    address: '',
    phone: '',
    operation_hours: '',
    is_active: true
  });

  const openAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({
      name: '',
      address: '',
      phone: '',
      operation_hours: '',
      is_active: true
    });
    setIsBranchModalOpen(true);
  };

  const openEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setBranchForm({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      operation_hours: branch.operation_hours || '',
      is_active: branch.is_active
    });
    setIsBranchModalOpen(true);
  };

  const handleSubmitBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name || !branchForm.address || !branchForm.phone) return;

    try {
      setIsSubmitting(true);
      const url = '/api/admin/branches';
      const method = editingBranch ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBranch ? { id: editingBranch.id, ...branchForm } : branchForm)
      });

      if (!res.ok) throw new Error();

      showToast(editingBranch ? 'Cabang diperbarui' : 'Cabang berhasil ditambahkan');
      fetchBranches();
      setIsBranchModalOpen(false);
    } catch (err) {
      showToast('Gagal menyimpan cabang', 'error');
    } finally {
      setIsSubmitting(false);
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

  const handleDeleteBranch = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      branchId: id,
      title: 'Hapus Cabang',
      message: `Hapus cabang ${name}? Tindakan ini bersifat permanen.`
    });
  };

  const confirmDelete = async () => {
    if (!confirmModal.branchId) return;
    try {
      const res = await fetch(`/api/admin/branches?id=${confirmModal.branchId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setBranches(branches.filter(b => b.id !== confirmModal.branchId));
      showToast('Cabang berhasil dihapus');
    } catch (e) {
      showToast('Gagal menghapus cabang', 'error');
    } finally {
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const filteredBranches = branches.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.address.toLowerCase().includes(searchQuery.toLowerCase())
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
            const isActiveSidebar = item.href === '/admin/branches';
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-[1.25rem] py-3.5 transition-all duration-200",
                  isSidebarCollapsed ? "justify-center px-0" : "px-5",
                  isActiveSidebar ? 'bg-slate-900 text-[#EFB036] shadow-xl' : 'text-slate-500 hover:bg-slate-50'
                )}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActiveSidebar ? 'text-[#EFB036]' : 'text-slate-400 group-hover:text-slate-900')} />
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
                  placeholder="Cari nama atau alamat cabang..."
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
          <div className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EFB036]">Logistics</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Manajemen Cabang</h1>
              <p className="mt-2 text-sm font-medium text-slate-500">Kelola lokasi dan status operasional outlet TakumaEat.</p>
            </div>
            <button
              onClick={openAddBranch}
              className="mt-6 flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-[#EFB036] shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95 lg:mt-0"
            >
              <Plus size={16} /> Tambah Cabang Baru
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Updating network map...</div>
            ) : filteredBranches.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No branches found</div>
            ) : filteredBranches.map((branch) => (
              <motion.div
                key={branch.id}
                layout
                className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                <div className="relative p-8 flex-1">
                  <div className="flex items-start justify-between mb-8">
                    <div className="h-16 w-16 rounded-2xl bg-[#EFB036]/10 flex items-center justify-center text-[#EFB036] shadow-inner">
                      <Store size={28} strokeWidth={2.5} />
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors",
                      branch.is_active
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-red-50 text-red-600 border border-red-100"
                    )}>
                      <div className={cn("h-1.5 w-1.5 rounded-full", branch.is_active ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                      {branch.is_active ? 'Operasional' : 'Tutup'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-[#EFB036] transition-colors line-clamp-1">
                        {branch.name}
                      </h3>
                      <div className="mt-2 flex items-start gap-2.5">
                        <div className="mt-0.5 h-6 w-6 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                          <MapPin size={12} className="text-slate-400" />
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic line-clamp-2">
                          {branch.address}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                          <Phone size={12} className="text-slate-400" />
                        </div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{branch.phone}</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                          <Clock size={12} className="text-[#EFB036]" />
                        </div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest line-clamp-1">{branch.operation_hours || '00:00 - 00:00'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative mt-8 border-t border-dashed border-slate-200 bg-slate-50/50 p-6 flex items-center justify-start gap-3">
                  <button
                    onClick={() => openEditBranch(branch)}
                    className="flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-[9px] font-black uppercase tracking-widest text-[#EFB036] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/5"
                  >
                    <Edit size={14} /> Edit Cabang
                  </button>
                  <button
                    onClick={() => handleDeleteBranch(branch.id, branch.name)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-50 bg-white text-red-500 transition-all hover:bg-red-500 hover:text-white hover:border-red-500 active:scale-95 shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Corner Decorative circles */}
                <div className="absolute left-0 bottom-[92px] -ml-3 h-6 w-6 rounded-full border border-slate-200 bg-slate-50/50" />
                <div className="absolute right-0 bottom-[92px] -mr-3 h-6 w-6 rounded-full border border-slate-200 bg-slate-50/50" />
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
                  <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-4 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-[0.1em]", item.href === '/admin/branches' ? 'bg-slate-900 text-[#EFB036]' : 'text-slate-500')}>
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

      {/* Branch Form Modal */}
      <AnimatePresence>
        {isBranchModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBranchModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-hidden rounded-[3rem] bg-white shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EFB036]">Network Management</p>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">{editingBranch ? 'Update Cabang' : 'Tambah Cabang Baru'}</h2>
                </div>
                <button onClick={() => setIsBranchModalOpen(false)} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmitBranch} className="flex-1 overflow-y-auto p-8 no-scrollbar bg-slate-50/30">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nama Cabang</label>
                    <input
                      required
                      value={branchForm.name}
                      onChange={e => setBranchForm({ ...branchForm, name: e.target.value })}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold focus:border-[#EFB036] focus:outline-none focus:ring-4 focus:ring-[#EFB036]/5"
                      placeholder="Contoh: TakumaEat Purwokerto"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Alamat Lengkap</label>
                    <textarea
                      required
                      value={branchForm.address}
                      onChange={e => setBranchForm({ ...branchForm, address: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold focus:border-[#EFB036] focus:outline-none focus:ring-4 focus:ring-[#EFB036]/5 min-h-[120px]"
                      placeholder="Masukkan alamat lengkap cabang..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nomor Telepon</label>
                    <input
                      required
                      type="tel"
                      value={branchForm.phone}
                      onChange={e => setBranchForm({ ...branchForm, phone: e.target.value })}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold focus:border-[#EFB036] focus:outline-none focus:ring-4 focus:ring-[#EFB036]/5"
                      placeholder="Contoh: 085798051625"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Jam Operasional</label>
                    <input
                      required
                      value={branchForm.operation_hours}
                      onChange={e => setBranchForm({ ...branchForm, operation_hours: e.target.value })}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold focus:border-[#EFB036] focus:outline-none focus:ring-4 focus:ring-[#EFB036]/5"
                      placeholder="Contoh: 08:00 - 22:00"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-white">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={branchForm.is_active}
                      onChange={e => setBranchForm({ ...branchForm, is_active: e.target.checked })}
                      className="h-5 w-5 rounded border-slate-300 text-[#EFB036] focus:ring-[#EFB036]"
                    />
                    <label htmlFor="is_active" className="text-xs font-black uppercase tracking-widest text-slate-700">Status Operasional (Buka)</label>
                  </div>
                </div>
              </form>

              <div className="p-8 border-t border-slate-100 bg-white sticky bottom-0 shrink-0">
                <button
                  onClick={handleSubmitBranch}
                  disabled={isSubmitting || !branchForm.name || !branchForm.address || !branchForm.phone}
                  className="w-full h-14 rounded-2xl bg-slate-900 text-[#EFB036] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'MEMPROSES...' : (editingBranch ? 'SIMPAN PERUBAHAN' : 'TAMBAHKAN CABANG')}
                </button>
                {(!branchForm.name || !branchForm.address || !branchForm.phone) && (
                  <p className="text-[9px] font-bold text-red-400 mt-3 text-center uppercase tracking-widest">Lengkapi Nama, Alamat, dan Telepon</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
