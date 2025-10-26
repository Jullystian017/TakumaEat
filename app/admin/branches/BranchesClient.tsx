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
  Plus,
  Edit,
  Trash2,
  X,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface BranchesClientProps {
  displayName: string;
  displayNameInitial: string;
  userEmail: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  openingHours: string;
  isActive: boolean;
  manager: string;
  totalOrders: number;
  revenue: number;
}

export default function BranchesClient({ displayName, displayNameInitial, userEmail }: BranchesClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form state
  const [formData, setFormData] = useState<Omit<Branch, 'id' | 'totalOrders' | 'revenue'>>({
    name: '',
    address: '',
    city: '',
    phone: '',
    openingHours: '',
    isActive: true,
    manager: ''
  });

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

  useEffect(() => {
    // Initialize with sample branches
    setBranches([
      {
        id: '1',
        name: 'TakumaEat Jakarta Pusat',
        address: 'Jl. Sudirman No. 123, Tanah Abang',
        city: 'Jakarta Pusat',
        phone: '021-12345678',
        openingHours: '10:00 - 22:00',
        isActive: true,
        manager: 'Budi Santoso',
        totalOrders: 1245,
        revenue: 125000000
      },
      {
        id: '2',
        name: 'TakumaEat Jakarta Selatan',
        address: 'Jl. Gatot Subroto No. 45, Kuningan',
        city: 'Jakarta Selatan',
        phone: '021-87654321',
        openingHours: '10:00 - 22:00',
        isActive: true,
        manager: 'Siti Aminah',
        totalOrders: 987,
        revenue: 98000000
      },
      {
        id: '3',
        name: 'TakumaEat Bandung',
        address: 'Jl. Dago No. 88, Coblong',
        city: 'Bandung',
        phone: '022-11223344',
        openingHours: '10:00 - 21:00',
        isActive: true,
        manager: 'Ahmad Rizki',
        totalOrders: 756,
        revenue: 75000000
      },
      {
        id: '4',
        name: 'TakumaEat Surabaya',
        address: 'Jl. Tunjungan No. 67, Genteng',
        city: 'Surabaya',
        phone: '031-55667788',
        openingHours: '10:00 - 22:00',
        isActive: true,
        manager: 'Dewi Lestari',
        totalOrders: 892,
        revenue: 89000000
      },
      {
        id: '5',
        name: 'TakumaEat Bali',
        address: 'Jl. Sunset Road No. 99, Kuta',
        city: 'Bali',
        phone: '0361-998877',
        openingHours: '09:00 - 23:00',
        isActive: true,
        manager: 'Eko Prasetyo',
        totalOrders: 1123,
        revenue: 112000000
      },
      {
        id: '6',
        name: 'TakumaEat Yogyakarta',
        address: 'Jl. Malioboro No. 22, Gedongtengen',
        city: 'Yogyakarta',
        phone: '0274-334455',
        openingHours: '10:00 - 21:00',
        isActive: false,
        manager: 'Rina Susanti',
        totalOrders: 234,
        revenue: 23000000
      }
    ]);
  }, []);

  const filteredBranches = branches.filter((branch) =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        address: branch.address,
        city: branch.city,
        phone: branch.phone,
        openingHours: branch.openingHours,
        isActive: branch.isActive,
        manager: branch.manager
      });
    } else {
      setEditingBranch(null);
      setFormData({
        name: '',
        address: '',
        city: '',
        phone: '',
        openingHours: '',
        isActive: true,
        manager: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBranch) {
      setBranches(branches.map(b => 
        b.id === editingBranch.id 
          ? { ...b, ...formData }
          : b
      ));
    } else {
      const newBranch: Branch = {
        id: Date.now().toString(),
        ...formData,
        totalOrders: 0,
        revenue: 0
      };
      setBranches([...branches, newBranch]);
    }
    
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus cabang ini?')) {
      setBranches(branches.filter(b => b.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setBranches(branches.map(b => 
      b.id === id ? { ...b, isActive: !b.isActive } : b
    ));
  };

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
            const isActive = item.href === '/admin/branches';
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive ? 'bg-[#EFB036]/10 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
              <p className="text-xs uppercase tracking-[0.3em] text-[#EFB036]">Branches Management</p>
              <h1 className="mt-2 text-2xl font-semibold md:text-3xl">Kelola Cabang</h1>
              <p className="mt-2 text-sm text-slate-600">Monitor dan kelola semua cabang TakumaEat.</p>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#EFB036] to-[#d89a28] text-sm font-bold text-white shadow-md">
                  {displayNameInitial}
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                  <p className="text-xs text-slate-500">{userEmail}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 px-6 py-10 lg:px-10">
          {/* Action Bar */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama cabang, kota, atau alamat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm shadow-sm transition-all placeholder:text-slate-400 focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20"
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 rounded-xl bg-[#EFB036] px-6 py-3 text-sm font-semibold text-black shadow-md transition-all hover:bg-[#dfa028]"
            >
              <Plus className="h-5 w-5" />
              Tambah Cabang
            </button>
          </div>

          {/* Branches Grid */}
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredBranches.map((branch) => (
              <div key={branch.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg">
                {/* Status Badge */}
                <div className="absolute right-4 top-4 z-10">
                  <button
                    onClick={() => handleToggleActive(branch.id)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                      branch.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {branch.isActive ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {branch.isActive ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>

                <div className="p-6">
                  {/* Branch Name */}
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFB036]/10">
                      <Store className="h-6 w-6 text-[#EFB036]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">{branch.name}</h3>
                      <p className="text-sm text-slate-500">{branch.city}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#EFB036]" />
                      <span>{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="h-4 w-4 flex-shrink-0 text-[#EFB036]" />
                      <span>{branch.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="h-4 w-4 flex-shrink-0 text-[#EFB036]" />
                      <span>{branch.openingHours}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users className="h-4 w-4 flex-shrink-0 text-[#EFB036]" />
                      <span>Manager: <span className="font-semibold text-slate-900">{branch.manager}</span></span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-600">Total Pesanan</p>
                      <p className="mt-1 text-xl font-bold text-slate-900">{branch.totalOrders}</p>
                    </div>
                    <div className="rounded-xl bg-[#EFB036]/10 p-3">
                      <p className="text-xs text-slate-600">Revenue</p>
                      <p className="mt-1 text-sm font-bold text-[#EFB036]">{formatCurrency(branch.revenue)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleOpenModal(branch)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-200"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(branch.id)}
                      className="flex items-center justify-center rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredBranches.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16">
              <Store className="h-16 w-16 text-slate-300" />
              <p className="mt-4 text-lg font-semibold text-slate-900">Tidak ada cabang ditemukan</p>
              <p className="mt-2 text-sm text-slate-500">Coba ubah kata kunci pencarian atau tambah cabang baru</p>
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900">{editingBranch ? 'Edit Cabang' : 'Tambah Cabang Baru'}</h2>
              <button onClick={handleCloseModal} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Nama Cabang *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: TakumaEat Jakarta Pusat"
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm transition-all focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Alamat *</label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Jl. Sudirman No. 123, Tanah Abang"
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm transition-all focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Kota *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Jakarta Pusat"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm transition-all focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Telepon *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="021-12345678"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm transition-all focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Jam Operasional *</label>
                    <input
                      type="text"
                      required
                      value={formData.openingHours}
                      onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                      placeholder="10:00 - 22:00"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm transition-all focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Manager *</label>
                    <input
                      type="text"
                      required
                      value={formData.manager}
                      onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                      placeholder="Nama Manager"
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm transition-all focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-[#EFB036] focus:ring-2 focus:ring-[#EFB036]/20"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Cabang Aktif</label>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#EFB036] px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-[#dfa028]"
                >
                  {editingBranch ? 'Simpan Perubahan' : 'Tambah Cabang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
