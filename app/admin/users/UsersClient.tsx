'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3, Bell, LayoutDashboard, Megaphone, Settings, ShoppingCart, Store,
  Users, UtensilsCrossed, Search, Plus, Edit, Trash2, X, Mail, Phone, MapPin,
  Calendar, ShieldCheck, User, Filter, AlertCircle,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminNotificationDropdown from '@/app/components/AdminNotificationDropdown';

interface UsersClientProps {
  displayName: string;
  displayNameInitial: string;
  userEmail: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  totalOrders?: number;
  totalSpent?: number;
  isActive?: boolean;
}

export default function UsersClient({ displayName, displayNameInitial, userEmail }: UsersClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  // Profile Dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [formData, setFormData] = useState({
    role: 'Customer',
    isActive: true
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users) {
        // Mocking stats for now or we could add another fetch
        setUsers(data.users.map((u: any) => ({
          ...u,
          totalOrders: Math.floor(Math.random() * 50), // Mocked for now
          totalSpent: Math.floor(Math.random() * 5000000), // Mocked
          isActive: true
        })));
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
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

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'All' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedRole]);

  const handleOpenModal = (user: UserData) => {
    setEditingUser(user);
    setFormData({ role: user.role, isActive: user.isActive ?? true });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingUser(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    // In a real app, we'd have a PATCH /api/admin/users/[id]
    // For now, let's just simulate the update locally as we don't have the specific PATCH route implemented yet.
    setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: formData.role, isActive: formData.isActive } : u));
    handleCloseModal();
  };

  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white px-6 py-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12"><Image src="/logotakuma.png" alt="Logo" fill className="object-contain" /></div>
          <div><p className="text-xs uppercase tracking-[0.3em] text-slate-500">TakumaEat</p><p className="text-lg font-semibold">Admin Hub</p></div>
        </div>
        <nav className="mt-12 flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/admin/users';
            return (<Link key={item.label} href={item.href} className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${isActive ? 'bg-[#EFB036]/10 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}>
              <item.icon className={`h-4 w-4 ${isActive ? 'text-[#EFB036]' : 'text-[#EFB036]'}`} /><span>{item.label}</span>
            </Link>);
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-6 py-5 backdrop-blur lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#EFB036]">Users Management</p>
              <h1 className="mt-2 text-2xl font-semibold md:text-3xl">Kelola Pengguna</h1>
              <p className="mt-2 text-sm text-slate-600">Monitor dan kelola semua pengguna TakumaEat secara real-time.</p>
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

        <main className="flex-1 overflow-y-auto bg-slate-50 px-6 py-10 lg:px-10">
          <div className="mb-8 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Cari nama atau email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm shadow-sm focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600"><Filter className="h-4 w-4" /><span>Role:</span></div>
              <div className="flex gap-2">
                {['All', 'Customer', 'Admin'].map((role) => (
                  <button key={role} onClick={() => setSelectedRole(role)} className={`rounded-full px-4 py-2 text-sm font-medium ${selectedRole === role ? 'bg-[#EFB036] text-black shadow-md' : 'border border-slate-200 bg-white text-slate-600'}`}>{role}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-20 text-center text-slate-400">Memuat data pengguna...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-600">User</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-600">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-600">Join Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-600">Orders</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-600">Total Spent</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-600">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 font-bold border border-slate-100">{user.name?.charAt(0) || 'U'}</div>
                            <div><p className="font-bold text-slate-900">{user.name}</p><p className="text-xs text-slate-500">{user.email}</p></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                            user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          )}>
                            {user.role === 'Admin' ? <ShieldCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}{user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4"><div className="flex items-center gap-1 text-sm text-slate-500 font-medium whitespace-nowrap"><Calendar className="h-4 w-4" />{formatDate(user.created_at)}</div></td>
                        <td className="px-6 py-4"><p className="text-lg font-bold text-slate-900">{user.totalOrders}</p></td>
                        <td className="px-6 py-4"><p className="font-bold text-[#EFB036]">{formatCurrency(user.totalSpent || 0)}</p></td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "rounded-full px-3 py-1 text-xs font-bold",
                            user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          )}>{user.isActive ? 'Aktif' : 'Nonaktif'}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleOpenModal(user)} className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-[#EFB036] hover:text-black transition-all"><Edit className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!isLoading && filteredUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16">
              <Users className="h-16 w-16 text-slate-300" />
              <p className="mt-4 text-lg font-semibold">Tidak ada user ditemukan</p>
            </div>
          )}

          {!isLoading && filteredUsers.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4">
              <div className="text-sm text-slate-600">Menampilkan <span className="font-semibold">{indexOfFirstUser + 1}</span> - <span className="font-semibold">{Math.min(indexOfLastUser, filteredUsers.length)}</span> dari <span className="font-semibold">{filteredUsers.length}</span></div>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="flex h-9 w-9 items-center justify-center rounded-lg border bg-white disabled:opacity-50"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (<button key={page} onClick={() => setCurrentPage(page)} className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold ${currentPage === page ? 'bg-[#EFB036] text-black' : 'border bg-white'}`}>{page}</button>))}
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="flex h-9 w-9 items-center justify-center rounded-lg border bg-white disabled:opacity-50"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
              </div>
            </div>
          )}
        </main>
      </div>

      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-8">
              <h2 className="text-xl font-black uppercase tracking-tight">Edit Role & Akses</h2>
              <button onClick={handleCloseModal} className="rounded-xl p-2 hover:bg-slate-100 text-slate-400"><X className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="h-14 w-14 rounded-2xl bg-[#EFB036]/10 flex items-center justify-center text-[#EFB036] font-bold text-xl">{editingUser.name?.charAt(0)}</div>
                <div>
                  <p className="font-black text-slate-900">{editingUser.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{editingUser.email}</p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase text-slate-500 tracking-widest">Akses Peran (Role)</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Admin', 'Customer'].map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role })}
                      className={cn(
                        "px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border",
                        formData.role === role ? 'bg-[#EFB036] text-black border-[#EFB036] shadow-lg shadow-[#EFB036]/20' : 'bg-white text-slate-400 border-slate-200'
                      )}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-[#EFB036] h-5 w-5" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Aktivasi Akun</p>
                    <p className="text-[10px] text-slate-500">Izin login ke dalam sistem</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                  )}
                >
                  <div className={cn("absolute h-4 w-4 bg-white rounded-full top-1 transition-all", formData.isActive ? 'right-1' : 'left-1')} />
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 rounded-2xl border border-slate-200 px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Batal</button>
                <button type="submit" className="flex-1 rounded-2xl bg-black px-6 py-4 text-xs font-black uppercase tracking-widest text-[#EFB036] hover:bg-slate-900 shadow-xl transition-all">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
