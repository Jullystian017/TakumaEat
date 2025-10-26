'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, Bell, LayoutDashboard, Megaphone, Settings, ShoppingCart, Store, Users, UtensilsCrossed, Search, Plus, Edit, Trash2, X, Mail, Phone, MapPin, Calendar, ShieldCheck, User, Filter } from 'lucide-react';

interface UsersClientProps {
  displayName: string;
  displayNameInitial: string;
  userEmail: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: 'Admin' | 'Customer';
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  isActive: boolean;
}

export default function UsersClient({ displayName, displayNameInitial, userEmail }: UsersClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [formData, setFormData] = useState<Omit<UserData, 'id' | 'totalOrders' | 'totalSpent' | 'joinDate'>>({
    name: '', email: '', phone: '', address: '', role: 'Customer', isActive: true
  });

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
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

  useEffect(() => {
    setUsers([
      { id: '1', name: 'Budi Santoso', email: 'budi@email.com', phone: '081234567890', address: 'Jl. Sudirman No. 123, Jakarta', role: 'Customer', joinDate: '2024-01-15', totalOrders: 45, totalSpent: 4500000, isActive: true },
      { id: '2', name: 'Siti Aminah', email: 'siti@email.com', phone: '081234567891', address: 'Jl. Gatot Subroto No. 45, Jakarta', role: 'Customer', joinDate: '2024-02-20', totalOrders: 32, totalSpent: 3200000, isActive: true },
      { id: '3', name: 'Ahmad Rizki', email: 'ahmad@email.com', phone: '081234567892', address: 'Jl. Thamrin No. 78, Jakarta', role: 'Admin', joinDate: '2023-12-01', totalOrders: 0, totalSpent: 0, isActive: true },
      { id: '4', name: 'Dewi Lestari', email: 'dewi@email.com', phone: '081234567893', address: 'Jl. Kuningan No. 90, Jakarta', role: 'Customer', joinDate: '2024-03-10', totalOrders: 28, totalSpent: 2800000, isActive: true },
      { id: '5', name: 'Eko Prasetyo', email: 'eko@email.com', phone: '081234567894', address: 'Jl. Senopati No. 12, Jakarta', role: 'Customer', joinDate: '2024-01-25', totalOrders: 56, totalSpent: 5600000, isActive: true },
      { id: '6', name: 'Rina Susanti', email: 'rina@email.com', phone: '081234567895', address: 'Jl. Merdeka No. 15, Jakarta', role: 'Admin', joinDate: '2023-11-15', totalOrders: 0, totalSpent: 0, isActive: true },
      { id: '7', name: 'Andi Wijaya', email: 'andi@email.com', phone: '081234567896', address: 'Jl. Asia Afrika No. 33, Jakarta', role: 'Customer', joinDate: '2024-02-05', totalOrders: 19, totalSpent: 1900000, isActive: false },
      { id: '8', name: 'Maya Putri', email: 'maya@email.com', phone: '081234567897', address: 'Jl. Diponegoro No. 67, Jakarta', role: 'Customer', joinDate: '2024-03-20', totalOrders: 41, totalSpent: 4100000, isActive: true },
      { id: '9', name: 'Rudi Hartono', email: 'rudi@email.com', phone: '081234567898', address: 'Jl. Veteran No. 22, Jakarta', role: 'Customer', joinDate: '2024-01-08', totalOrders: 63, totalSpent: 6300000, isActive: true },
      { id: '10', name: 'Sari Indah', email: 'sari@email.com', phone: '081234567899', address: 'Jl. Proklamasi No. 45, Jakarta', role: 'Customer', joinDate: '2024-02-14', totalOrders: 37, totalSpent: 3700000, isActive: true },
      { id: '11', name: 'Bambang Setiawan', email: 'bambang@email.com', phone: '081234567800', address: 'Jl. Cikini Raya No. 33, Jakarta', role: 'Customer', joinDate: '2024-03-01', totalOrders: 24, totalSpent: 2400000, isActive: true },
      { id: '12', name: 'Lina Marlina', email: 'lina@email.com', phone: '081234567801', address: 'Jl. Teuku Umar No. 99, Jakarta', role: 'Customer', joinDate: '2024-01-30', totalOrders: 52, totalSpent: 5200000, isActive: true }
    ]);
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()) || user.phone.includes(searchQuery);
    const matchesRole = selectedRole === 'All' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedRole]);

  const handleOpenModal = (user?: UserData) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, phone: user.phone, address: user.address, role: user.role, isActive: user.isActive });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', phone: '', address: '', role: 'Customer', isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingUser(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
    } else {
      const newUser: UserData = { id: Date.now().toString(), ...formData, joinDate: new Date().toISOString().split('T')[0], totalOrders: 0, totalSpent: 0 };
      setUsers([newUser, ...users]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => { if (confirm('Apakah Anda yakin ingin menghapus user ini?')) { setUsers(users.filter(u => u.id !== id)); } };
  const handleToggleActive = (id: string) => { setUsers(users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u)); };

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
              <p className="mt-2 text-sm text-slate-600">Monitor dan kelola semua pengguna TakumaEat.</p>
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

        <main className="flex-1 overflow-y-auto bg-slate-50 px-6 py-10 lg:px-10">
          <div className="mb-8 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Cari nama, email, atau telepon..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm shadow-sm focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20" />
              </div>
              <button onClick={() => handleOpenModal()} className="flex items-center gap-2 rounded-xl bg-[#EFB036] px-6 py-3 text-sm font-semibold text-black shadow-md hover:bg-[#dfa028]">
                <Plus className="h-5 w-5" />Tambah User
              </button>
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

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-600">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-600">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-600">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-600">Join Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-600">Orders</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-600">Total Spent</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-600">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#EFB036] to-[#d89a28] text-sm font-bold text-white">{user.name.charAt(0)}</div>
                          <div><p className="font-semibold">{user.name}</p><p className="text-xs text-slate-500">{user.email}</p></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1 text-slate-600"><Phone className="h-3 w-3" />{user.phone}</div>
                          <div className="flex items-start gap-1 text-slate-500"><MapPin className="h-3 w-3 mt-0.5" /><span className="line-clamp-1">{user.address}</span></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {user.role === 'Admin' ? <ShieldCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}{user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4"><div className="flex items-center gap-1 text-sm text-slate-500"><Calendar className="h-4 w-4" />{formatDate(user.joinDate)}</div></td>
                      <td className="px-6 py-4"><p className="text-lg font-semibold">{user.totalOrders}</p></td>
                      <td className="px-6 py-4"><p className="font-semibold text-[#EFB036]">{formatCurrency(user.totalSpent)}</p></td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleToggleActive(user.id)} className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{user.isActive ? 'Aktif' : 'Nonaktif'}</button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleOpenModal(user)} className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"><Edit className="h-3.5 w-3.5" />Edit</button>
                          <button onClick={() => handleDelete(user.id)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16">
              <Users className="h-16 w-16 text-slate-300" />
              <p className="mt-4 text-lg font-semibold">Tidak ada user ditemukan</p>
            </div>
          )}

          {filteredUsers.length > 0 && totalPages > 1 && (
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b p-6">
              <h2 className="text-xl font-bold">{editingUser ? 'Edit User' : 'Tambah User'}</h2>
              <button onClick={handleCloseModal} className="rounded-lg p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {editingUser ? (
                <>
                  {/* Read-only user info when editing */}
                  <div className="rounded-xl bg-slate-50 p-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Informasi User (Tidak dapat diubah)</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-600">Nama</p>
                        <p className="font-semibold text-slate-900">{formData.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Email</p>
                        <p className="font-semibold text-slate-900">{formData.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Telepon</p>
                        <p className="font-semibold text-slate-900">{formData.phone}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-xs text-slate-600">Alamat</p>
                        <p className="font-semibold text-slate-900">{formData.address}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 italic">* User dapat mengubah data pribadi mereka sendiri di halaman profil</p>
                  </div>
                  
                  {/* Editable fields for admin */}
                  <div><label className="mb-2 block text-sm font-semibold">Role *</label><select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as 'Admin' | 'Customer' })} className="h-11 w-full rounded-lg border px-4 focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20"><option value="Customer">Customer</option><option value="Admin">Admin</option></select></div>
                  <div className="flex items-center gap-3"><input type="checkbox" id="active" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="h-4 w-4 rounded" /><label htmlFor="active" className="text-sm font-medium">User Aktif</label></div>
                </>
              ) : (
                <>
                  {/* Full form when adding new user */}
                  <div><label className="mb-2 block text-sm font-semibold">Nama *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-11 w-full rounded-lg border px-4 focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20" /></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><label className="mb-2 block text-sm font-semibold">Email *</label><input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-11 w-full rounded-lg border px-4 focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20" /></div>
                    <div><label className="mb-2 block text-sm font-semibold">Telepon *</label><input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="h-11 w-full rounded-lg border px-4 focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20" /></div>
                  </div>
                  <div><label className="mb-2 block text-sm font-semibold">Alamat *</label><textarea required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} className="w-full rounded-lg border px-4 py-3 focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20" /></div>
                  <div><label className="mb-2 block text-sm font-semibold">Role *</label><select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as 'Admin' | 'Customer' })} className="h-11 w-full rounded-lg border px-4 focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20"><option value="Customer">Customer</option><option value="Admin">Admin</option></select></div>
                  <div className="flex items-center gap-3"><input type="checkbox" id="active" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="h-4 w-4 rounded" /><label htmlFor="active" className="text-sm font-medium">User Aktif</label></div>
                </>
              )}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 rounded-xl border px-6 py-3 text-sm font-semibold hover:bg-slate-50">Batal</button>
                <button type="submit" className="flex-1 rounded-xl bg-[#EFB036] px-6 py-3 text-sm font-semibold text-black hover:bg-[#dfa028]">{editingUser ? 'Simpan Perubahan' : 'Tambah User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
