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
  Tag,
  Search,
  Filter,
  MoreVertical,
  Plus,
  Trash2,
  UserCheck,
  UserX,
  X,
  Shield,
  Clock,
  LogOut,
  ChevronLeft,
  ChevronDown,
  Menu,
  Mail,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import AdminNotificationDropdown from '@/app/components/AdminNotificationDropdown';
import { ConfirmationModal, StatusToast, type ToastType } from '@/app/components/AdminActionUI';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  totalOrders: number;
  totalSpent: number;
  isActive: boolean;
}

interface UserDetail extends User {
  stats: {
    totalSpent: number;
    orderCount: number;
    successCount: number;
    lastOrderDate: string | null;
    avgOrderValue: number;
  };
  orders: any[];
}

interface UsersClientProps {
  displayName: string;
  displayNameInitial: string;
  userEmail: string;
  users?: User[];
}

export default function UsersClient({ displayName, displayNameInitial, userEmail, users: initialUsers = [] }: UsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isLoading, setIsLoading] = useState(initialUsers.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: string | null;
    title: string;
    message: string;
    actionType: 'delete' | 'toggleRole' | 'toggleStatus';
  }>({
    isOpen: false,
    userId: null,
    title: '',
    message: '',
    actionType: 'delete'
  });

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ isOpen: true, message, type });
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      showToast('Gagal memuat data pengguna', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialUsers.length === 0) {
      fetchUsers();
    }
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  const fetchUserDetail = async (userId: string) => {
    try {
      setIsLoadingDetail(true);
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUserDetail({
        ...data.profile,
        stats: data.stats,
        orders: data.orders
      });
      setIsDetailOpen(true);
    } catch (e) {
      showToast('Gagal memuat detail pengguna', 'error');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
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

  const handleAction = (userId: string, action: 'delete' | 'toggleRole' | 'toggleStatus') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (action === 'delete') {
      setConfirmModal({
        isOpen: true,
        userId,
        title: 'Hapus Pengguna',
        message: `Hapus permanent akun ${user.name}? Semua data order juga akan terdampak.`,
        actionType: 'delete'
      });
    } else if (action === 'toggleRole') {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      setConfirmModal({
        isOpen: true,
        userId,
        title: 'Ubah Peran',
        message: `Ubah peran ${user.name} menjadi ${newRole.toUpperCase()}?`,
        actionType: 'toggleRole'
      });
    } else {
      setConfirmModal({
        isOpen: true,
        userId,
        title: user.isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun',
        message: `${user.isActive ? 'Nonaktifkan' : 'Aktifkan'} akses sitem untuk ${user.name}?`,
        actionType: 'toggleStatus'
      });
    }
  };

  const confirmAction = async () => {
    const { userId, actionType } = confirmModal;
    if (!userId) return;

    try {
      if (actionType === 'delete') {
        const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        setUsers(users.filter(u => u.id !== userId));
        showToast('Pengguna berhasil dihapus');
        if (selectedUser?.id === userId) setIsDetailOpen(false);
      } else if (actionType === 'toggleRole') {
        const user = users.find(u => u.id === userId);
        const newRole = user?.role === 'admin' ? 'user' : 'admin';
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole })
        });
        if (!res.ok) throw new Error();
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        showToast(`Peran diperbarui ke ${newRole.toUpperCase()}`);
      } else {
        const user = users.find(u => u.id === userId);
        const newStatus = !user?.isActive;
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: newStatus })
        });
        if (!res.ok) throw new Error();
        setUsers(users.map(u => u.id === userId ? { ...u, isActive: newStatus } : u));
        showToast(`Akun ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
      }
    } catch (e) {
      showToast('Tindakan gagal dilakukan', 'error');
    } finally {
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
            const isActive = item.href === '/admin/users';
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
                  placeholder="Cari nama atau email pengguna..."
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
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EFB036]">Membership</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Manajemen Pengguna</h1>
              <p className="mt-2 text-sm font-medium text-slate-500">Kelola hak akses dan data seluruh pengguna sistem TakumaEat.</p>
            </div>
            <div className="mt-6 flex gap-2 rounded-2xl bg-white p-1.5 shadow-sm border border-slate-100 lg:mt-0">
              {['all', 'admin', 'user'].map(filter => (
                <button key={filter} onClick={() => setRoleFilter(filter)} className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", roleFilter === filter ? "bg-slate-900 text-[#EFB036]" : "text-slate-500")}>
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-l-2xl">Identity</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Security & Role</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Order Stats</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-10">Joined Date</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-r-2xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Processing database...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No users match criteria</td></tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="transition-all hover:bg-slate-50/50 group cursor-pointer"
                        onClick={() => {
                          setSelectedUser(user);
                          fetchUserDetail(user.id);
                        }}
                      >
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-[1.25rem] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-black text-slate-500 shadow-sm transition-transform group-hover:scale-110">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-900 group-hover:text-[#EFB036] transition-colors">{user.name}</p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Mail size={10} className="text-slate-300" />
                                <p className="text-[10px] font-bold text-slate-400">{user.email}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                              user.role === 'admin' ? "bg-slate-900 text-[#EFB036] border-slate-900 shadow-lg shadow-black/10" : "bg-white text-slate-400 border-slate-200"
                            )}>
                              {user.role}
                            </div>
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              user.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-red-400"
                            )} />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <p className="text-[10px] font-black text-slate-900">{formatCurrency(user.totalSpent || 0)}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{user.totalOrders || 0} Total Pesanan</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right pr-10">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(user.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
                            <button onClick={() => handleAction(user.id, 'toggleRole')} className="p-2.5 rounded-xl bg-slate-900 text-[#EFB036] shadow-md transition-all hover:scale-110" title="Ubah Role"><Shield size={14} /></button>
                            <button onClick={() => handleAction(user.id, 'toggleStatus')} className={cn("p-2.5 rounded-xl border transition-all hover:scale-110", user.isActive ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100')} title={user.isActive ? 'Suspend' : 'Activate'}>{user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}</button>
                            <button onClick={() => handleAction(user.id, 'delete')} className="p-2.5 rounded-xl bg-slate-50 text-slate-300 hover:bg-red-600 hover:text-white transition-all hover:scale-110" title="Delete Account"><Trash2 size={14} /></button>
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

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed inset-y-0 left-0 z-[70] w-72 bg-white px-6 py-10 lg:hidden shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <Image src="/logotakuma.png" alt="Logo" width={40} height={40} className="object-contain" />
                  <p className="text-lg font-black text-slate-900">Admin Hub</p>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl bg-slate-50 text-slate-400"><X size={20} /></button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-4 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-[0.1em]", item.href === '/admin/users' ? 'bg-slate-900 text-[#EFB036]' : 'text-slate-500')}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <ConfirmationModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} onConfirm={confirmAction} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} type={confirmModal.actionType === 'delete' ? 'danger' : 'warning'} />
      <AnimatePresence>{toast.isOpen && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, isOpen: false })} />}</AnimatePresence>

      {/* User Detail Modal */}
      <AnimatePresence>
        {isDetailOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDetailOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] bg-white shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-8 lg:p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-[2.5rem] bg-slate-900 flex items-center justify-center text-3xl font-black text-[#EFB036] shadow-2xl">
                    {selectedUser?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#EFB036]">User Profile</p>
                    <h2 className="text-3xl font-black text-slate-900 mt-1">{selectedUser?.name}</h2>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Mail size={12} className="text-[#EFB036]" /> {selectedUser?.email}
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                        selectedUser?.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                      )}>
                        {selectedUser?.isActive ? 'Active Member' : 'Suspended'}
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsDetailOpen(false)} className="p-4 rounded-[1.5rem] bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar lg:p-10 p-6">
                {isLoadingDetail ? (
                  <div className="h-64 flex items-center justify-center flex-col gap-4">
                    <div className="h-10 w-10 border-4 border-slate-900 border-t-[#EFB036] rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Fetching account data...</p>
                  </div>
                ) : userDetail && (
                  <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-1 space-y-8">
                      {/* Stats Card */}
                      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10"><ShoppingCart size={80} strokeWidth={1} /></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EFB036]/60">Spending Analytics</p>
                        <h3 className="text-3xl font-black mt-4">{formatCurrency(userDetail.stats.totalSpent)}</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1 italic">Total spent across {userDetail.stats.orderCount} orders</p>

                        <div className="grid grid-cols-2 gap-4 mt-10">
                          <div>
                            <p className="text-[9px] font-black uppercase text-[#EFB036]/60 tracking-widest">Avg Value</p>
                            <p className="text-sm font-black mt-1">{formatCurrency(userDetail.stats.avgOrderValue)}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase text-[#EFB036]/60 tracking-widest">Success Rate</p>
                            <p className="text-sm font-black mt-1">{userDetail.stats.successCount} Orders</p>
                          </div>
                        </div>
                      </div>

                      {/* Account Info */}
                      <div className="space-y-6 px-4">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Join Date</p>
                          <div className="flex items-center gap-3 mt-2 text-xs font-bold text-slate-600">
                            <Clock size={16} className="text-[#EFB036]" />
                            {new Date(userDetail.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Account Security</p>
                          <div className="flex items-center gap-3 mt-2 text-xs font-bold text-slate-600">
                            <ShieldCheck size={16} className="text-[#EFB036]" />
                            Role: <span className="uppercase">{userDetail.role}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center justify-between">
                        <span>Riwayat Pesanan Terakhir</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#EFB036]">Last 10 Orders</span>
                      </h4>

                      <div className="space-y-4">
                        {userDetail.orders.length === 0 ? (
                          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[2rem] p-10 text-center">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Belum ada pesanan</p>
                          </div>
                        ) : userDetail.orders.map(order => (
                          <div key={order.id} className="group p-5 rounded-[2rem] bg-white border border-slate-100 hover:border-[#EFB036]/30 transition-all hover:shadow-xl hover:shadow-black/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 transition-colors group-hover:bg-[#EFB036]/10 group-hover:text-[#EFB036]">
                                <ShoppingCart size={20} />
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-900">Order #{order.id.slice(0, 8)}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                                  {new Date(order.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-slate-900 underline decoration-[#EFB036]/30">{formatCurrency(order.total_amount)}</p>
                              <span className={cn(
                                "text-[8px] font-black uppercase tracking-[0.15em] mt-1 inline-block",
                                order.status === 'completed' ? 'text-emerald-500' : 'text-[#EFB036]'
                              )}>{order.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-8 lg:px-10 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
                <div className="flex gap-4">
                  <button onClick={() => { handleAction(selectedUser!.id, 'toggleRole'); }} className="h-12 px-8 rounded-2xl bg-slate-900 text-[#EFB036] text-[10px] font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105">Ubah Peran Sistem</button>
                  <button onClick={() => { handleAction(selectedUser!.id, 'toggleStatus'); }} className={cn("h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 border", selectedUser?.isActive ? 'bg-white text-red-500 border-red-100 shadow-sm' : 'bg-emerald-500 text-white border-emerald-500 shadow-xl shadow-emerald-500/20')}>{selectedUser?.isActive ? 'Suspend Access' : 'Reactivate Access'}</button>
                </div>
                <button onClick={() => { handleAction(selectedUser!.id, 'delete'); }} className="h-12 w-12 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center transition-all hover:bg-red-500 hover:text-white"><Trash2 size={20} /></button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
