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
  Calendar,
  Percent,
  Tag,
  Eye,
  EyeOff
} from 'lucide-react';

interface PromoClientProps {
  displayName: string;
  displayNameInitial: string;
  userEmail: string;
}

interface Promo {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'Percentage' | 'Fixed';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}

export default function PromoClient({ displayName, displayNameInitial, userEmail }: PromoClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [promos, setPromos] = useState<Promo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const promosPerPage = 8;

  // Form state
  const [formData, setFormData] = useState<Omit<Promo, 'id' | 'usageCount'>>({
    code: '',
    name: '',
    description: '',
    discountType: 'Percentage',
    discountValue: 0,
    minPurchase: 0,
    maxDiscount: undefined,
    startDate: '',
    endDate: '',
    usageLimit: 0,
    isActive: true
  });

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
      year: 'numeric'
    });
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
    // Initialize with sample promos
    setPromos([
      {
        id: '1',
        code: 'NEWUSER50',
        name: 'Diskon Pelanggan Baru',
        description: 'Diskon 50% untuk pelanggan baru, maksimal Rp 50.000',
        discountType: 'Percentage',
        discountValue: 50,
        minPurchase: 100000,
        maxDiscount: 50000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        usageLimit: 1000,
        usageCount: 234,
        isActive: true
      },
      {
        id: '2',
        code: 'WEEKEND30',
        name: 'Diskon Weekend',
        description: 'Diskon 30% setiap weekend untuk semua menu',
        discountType: 'Percentage',
        discountValue: 30,
        minPurchase: 75000,
        maxDiscount: 40000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        usageLimit: 500,
        usageCount: 156,
        isActive: true
      },
      {
        id: '3',
        code: 'FREESHIP',
        name: 'Gratis Ongkir',
        description: 'Gratis ongkir untuk pembelian minimal Rp 150.000',
        discountType: 'Fixed',
        discountValue: 15000,
        minPurchase: 150000,
        startDate: '2024-01-15',
        endDate: '2024-06-30',
        usageLimit: 2000,
        usageCount: 892,
        isActive: true
      },
      {
        id: '4',
        code: 'RAMADAN25',
        name: 'Promo Ramadan',
        description: 'Diskon spesial 25% selama bulan Ramadan',
        discountType: 'Percentage',
        discountValue: 25,
        minPurchase: 50000,
        maxDiscount: 35000,
        startDate: '2024-03-11',
        endDate: '2024-04-10',
        usageLimit: 1500,
        usageCount: 1245,
        isActive: false
      },
      {
        id: '5',
        code: 'CASHBACK20K',
        name: 'Cashback Rp 20.000',
        description: 'Cashback Rp 20.000 untuk pembelian minimal Rp 200.000',
        discountType: 'Fixed',
        discountValue: 20000,
        minPurchase: 200000,
        startDate: '2024-02-01',
        endDate: '2024-12-31',
        usageLimit: 800,
        usageCount: 345,
        isActive: true
      },
      {
        id: '6',
        code: 'LUNCH15',
        name: 'Diskon Makan Siang',
        description: 'Diskon 15% untuk pemesanan jam 11:00 - 14:00',
        discountType: 'Percentage',
        discountValue: 15,
        minPurchase: 50000,
        maxDiscount: 25000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        usageLimit: 3000,
        usageCount: 1567,
        isActive: true
      },
      {
        id: '7',
        code: 'BIRTHDAY50K',
        name: 'Voucher Ulang Tahun',
        description: 'Voucher Rp 50.000 untuk pelanggan yang berulang tahun',
        discountType: 'Fixed',
        discountValue: 50000,
        minPurchase: 100000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        usageLimit: 500,
        usageCount: 123,
        isActive: true
      },
      {
        id: '8',
        code: 'PAYDAY40',
        name: 'Promo Gajian',
        description: 'Diskon 40% tanggal 25-31 setiap bulan',
        discountType: 'Percentage',
        discountValue: 40,
        minPurchase: 120000,
        maxDiscount: 60000,
        startDate: '2024-01-25',
        endDate: '2024-12-31',
        usageLimit: 1000,
        usageCount: 678,
        isActive: true
      }
    ]);
  }, []);

  const filteredPromos = promos.filter((promo) =>
    promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    promo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredPromos.length / promosPerPage);
  const indexOfLastPromo = currentPage * promosPerPage;
  const indexOfFirstPromo = indexOfLastPromo - promosPerPage;
  const currentPromos = filteredPromos.slice(indexOfFirstPromo, indexOfLastPromo);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleOpenModal = (promo?: Promo) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        code: promo.code,
        name: promo.name,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        minPurchase: promo.minPurchase,
        maxDiscount: promo.maxDiscount,
        startDate: promo.startDate,
        endDate: promo.endDate,
        usageLimit: promo.usageLimit,
        isActive: promo.isActive
      });
    } else {
      setEditingPromo(null);
      setFormData({
        code: '',
        name: '',
        description: '',
        discountType: 'Percentage',
        discountValue: 0,
        minPurchase: 0,
        maxDiscount: undefined,
        startDate: '',
        endDate: '',
        usageLimit: 0,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPromo(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPromo) {
      setPromos(promos.map(p => 
        p.id === editingPromo.id 
          ? { ...p, ...formData }
          : p
      ));
    } else {
      const newPromo: Promo = {
        id: Date.now().toString(),
        ...formData,
        usageCount: 0
      };
      setPromos([newPromo, ...promos]);
    }
    
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus promo ini?')) {
      setPromos(promos.filter(p => p.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setPromos(promos.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ));
  };

  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      {/* Sidebar - Same as other pages */}
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
            const isActive = item.href === '/admin/promo';
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
              <p className="text-xs uppercase tracking-[0.3em] text-[#EFB036]">Promo Management</p>
              <h1 className="mt-2 text-2xl font-semibold md:text-3xl">Kelola Promo & Diskon</h1>
              <p className="mt-2 text-sm text-slate-600">Buat dan kelola promo untuk meningkatkan penjualan.</p>
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
                placeholder="Cari kode atau nama promo..."
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
              Tambah Promo
            </button>
          </div>

          {/* Promo Grid - Will continue in next file */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currentPromos.map((promo) => (
              <div key={promo.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg">
                <div className="absolute right-4 top-4 z-10">
                  <button
                    onClick={() => handleToggleActive(promo.id)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      promo.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {promo.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {promo.isActive ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>

                <div className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Tag className="h-5 w-5 text-[#EFB036]" />
                    <span className="text-lg font-bold text-slate-900">{promo.code}</span>
                  </div>

                  <h3 className="mb-2 text-base font-semibold text-slate-900">{promo.name}</h3>
                  <p className="mb-4 line-clamp-2 text-sm text-slate-600">{promo.description}</p>

                  <div className="mb-4 rounded-xl bg-[#EFB036]/10 p-3">
                    <div className="flex items-center gap-2">
                      <Percent className="h-5 w-5 text-[#EFB036]" />
                      <span className="text-2xl font-bold text-[#EFB036]">
                        {promo.discountType === 'Percentage' ? `${promo.discountValue}%` : formatCurrency(promo.discountValue)}
                      </span>
                    </div>
                    {promo.maxDiscount && <p className="mt-1 text-xs text-slate-600">Maks. {formatCurrency(promo.maxDiscount)}</p>}
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Min. Pembelian:</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(promo.minPurchase)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Penggunaan:</span>
                      <span className="font-semibold text-slate-900">{promo.usageCount} / {promo.usageLimit}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(promo.startDate)} - {formatDate(promo.endDate)}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-[#EFB036] transition-all" style={{ width: `${(promo.usageCount / promo.usageLimit) * 100}%` }} />
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button onClick={() => handleOpenModal(promo)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-200">
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button onClick={() => handleDelete(promo.id)} className="flex items-center justify-center rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-100">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredPromos.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16">
              <Megaphone className="h-16 w-16 text-slate-300" />
              <p className="mt-4 text-lg font-semibold text-slate-900">Tidak ada promo ditemukan</p>
              <p className="mt-2 text-sm text-slate-500">Coba ubah kata kunci pencarian atau buat promo baru</p>
            </div>
          )}

          {/* Pagination */}
          {filteredPromos.length > 0 && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
              <div className="text-sm text-slate-600">
                Menampilkan <span className="font-semibold text-slate-900">{indexOfFirstPromo + 1}</span> - <span className="font-semibold text-slate-900">{Math.min(indexOfLastPromo, filteredPromos.length)}</span> dari <span className="font-semibold text-slate-900">{filteredPromos.length}</span> promo
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-all ${currentPage === page ? 'bg-[#EFB036] text-black shadow-md' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal - Placeholder for now */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900">{editingPromo ? 'Edit Promo' : 'Tambah Promo Baru'}</h2>
              <button onClick={handleCloseModal} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <p className="text-center text-slate-600">Form will be added in the next iteration</p>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={handleCloseModal} className="flex-1 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50">
                  Batal
                </button>
                <button type="submit" className="flex-1 rounded-xl bg-[#EFB036] px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-[#dfa028]">
                  {editingPromo ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
