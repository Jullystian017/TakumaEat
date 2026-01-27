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
  discount_type: 'Percentage' | 'Fixed';
  discount_value: number;
  min_purchase: number;
  max_discount?: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
  usage_count: number;
  is_active: boolean;
  image_url?: string;
}

export default function PromoClient({ displayName, displayNameInitial, userEmail }: PromoClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [promos, setPromos] = useState<Promo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Promo>>({
    code: '',
    name: '',
    description: '',
    discount_type: 'Percentage',
    discount_value: 0,
    min_purchase: 0,
    max_discount: undefined,
    start_date: '',
    end_date: '',
    usage_limit: 0,
    is_active: true,
    image_url: ''
  });

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

  const fetchPromos = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/promos');
      const data = await res.json();
      if (data.promos) setPromos(data.promos);
    } catch (error) {
      console.error('Failed to fetch promos', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
  }

  function formatDate(dateString: string) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  const filteredPromos = promos.filter((promo) =>
    promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    promo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (promo?: Promo) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        code: promo.code,
        name: promo.name,
        description: promo.description,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        min_purchase: promo.min_purchase,
        max_discount: promo.max_discount,
        start_date: promo.start_date ? new Date(promo.start_date).toISOString().slice(0, 16) : '',
        end_date: promo.end_date ? new Date(promo.end_date).toISOString().slice(0, 16) : '',
        usage_limit: promo.usage_limit,
        is_active: promo.is_active,
        image_url: promo.image_url || ''
      });
    } else {
      setEditingPromo(null);
      setFormData({
        code: '',
        name: '',
        description: '',
        discount_type: 'Percentage',
        discount_value: 0,
        min_purchase: 0,
        max_discount: undefined,
        start_date: '',
        end_date: '',
        usage_limit: 0,
        is_active: true,
        image_url: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPromo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = '/api/admin/promos';
      const method = editingPromo ? 'PUT' : 'POST';
      const body = editingPromo ? { id: editingPromo.id, ...formData } : formData;

      // Ensure dates are sent in a way the server handles correctly
      if (body.start_date) body.start_date = new Date(body.start_date).toISOString();
      if (body.end_date) body.end_date = new Date(body.end_date).toISOString();

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('Failed to save promo');

      await fetchPromos();
      handleCloseModal();
    } catch (error) {
      alert('Gagal menyimpan promo');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus promo ini?')) return;

    try {
      const res = await fetch(`/api/admin/promos?id=${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete promo');

      setPromos(promos.filter(p => p.id !== id));
    } catch (error) {
      alert('Gagal menghapus promo');
      console.error(error);
    }
  };

  const handleToggleActive = async (promo: Promo) => {
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: promo.id, is_active: !promo.is_active })
      });

      if (!res.ok) throw new Error('Failed to update status');

      setPromos(promos.map(p =>
        p.id === promo.id ? { ...p, is_active: !p.is_active } : p
      ));
    } catch (error) {
      console.error(error);
    }
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
            const isActive = item.href === '/admin/promo';
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

          {/* Promo Grid */}
          {isLoading ? (
            <div className="text-center py-20 text-slate-500">Memuat data promo...</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPromos.map((promo) => (
                <div key={promo.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg">
                  <div className="absolute right-4 top-4 z-10">
                    <button
                      onClick={() => handleToggleActive(promo)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${promo.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                      {promo.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                      {promo.image_url ? (
                        <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                          <img src={promo.image_url} alt={promo.code} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <Tag className="h-5 w-5 text-[#EFB036]" />
                      )}
                      <span className="text-lg font-bold text-slate-900">{promo.code}</span>
                    </div>

                    <h3 className="mb-2 text-base font-semibold text-slate-900">{promo.name}</h3>
                    <p className="mb-4 line-clamp-2 text-sm text-slate-600">{promo.description}</p>

                    <div className="mb-4 rounded-xl bg-[#EFB036]/10 p-3">
                      <div className="flex items-center gap-2">
                        <Percent className="h-5 w-5 text-[#EFB036]" />
                        <span className="text-2xl font-bold text-[#EFB036]">
                          {promo.discount_type === 'Percentage' ? `${promo.discount_value}%` : formatCurrency(promo.discount_value)}
                        </span>
                      </div>
                      <div className="mt-1 flex justify-between items-center text-xs text-slate-600">
                        <span>{promo.discount_type === 'Percentage' ? 'Diskon Persen' : 'Potongan Harga'}</span>
                        {promo.max_discount && <span>Max: {formatCurrency(promo.max_discount)}</span>}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Min. Pembelian:</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(promo.min_purchase)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Penggunaan:</span>
                        <span className="font-semibold text-slate-900">{promo.usage_count} / {promo.usage_limit || '∞'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span className="truncate">{formatDate(promo.start_date)} - {formatDate(promo.end_date)}</span>
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
          )}

          {/* Empty State */}
          {!isLoading && filteredPromos.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16">
              <Megaphone className="h-16 w-16 text-slate-300" />
              <p className="mt-4 text-lg font-semibold text-slate-900">Tidak ada promo ditemukan</p>
              <p className="mt-2 text-sm text-slate-500">Coba ubah kata kunci pencarian atau buat promo baru</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900">{editingPromo ? 'Edit Promo' : 'Tambah Promo Baru'}</h2>
              <button onClick={handleCloseModal} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Kode Promo *</label>
                    <input type="text" required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="CONTOH: SUPER50" className="h-11 w-full rounded-lg border border-slate-300 px-4 uppercase" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Nama Promo *</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Diskon Spesial" className="h-11 w-full rounded-lg border border-slate-300 px-4" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Deskripsi</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-300 px-4 py-3" />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Tipe Diskon</label>
                    <select value={formData.discount_type} onChange={(e: any) => setFormData({ ...formData, discount_type: e.target.value })} className="h-11 w-full rounded-lg border border-slate-300 px-4">
                      <option value="Percentage">Persentase (%)</option>
                      <option value="Fixed">Nominal (Rp)</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Nilai Diskon *</label>
                    <input type="number" required value={formData.discount_value} onChange={e => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })} className="h-11 w-full rounded-lg border border-slate-300 px-4" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Min. Pembelian</label>
                    <input type="number" value={formData.min_purchase} onChange={e => setFormData({ ...formData, min_purchase: parseFloat(e.target.value) })} className="h-11 w-full rounded-lg border border-slate-300 px-4" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Max. Diskon {formData.discount_type === 'Percentage' && '(Opsional)'}</label>
                    <input type="number" value={formData.max_discount || ''} onChange={e => setFormData({ ...formData, max_discount: e.target.value ? parseFloat(e.target.value) : undefined })} className="h-11 w-full rounded-lg border border-slate-300 px-4" disabled={formData.discount_type === 'Fixed'} placeholder={formData.discount_type === 'Fixed' ? 'Tidak berlaku' : ''} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Mulai Tanggal *</label>
                    <input type="datetime-local" required value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="h-11 w-full rounded-lg border border-slate-300 px-4" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Sampai Tanggal *</label>
                    <input type="datetime-local" required value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="h-11 w-full rounded-lg border border-slate-300 px-4" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Batas Penggunaan (0 = Unlimited)</label>
                    <input type="number" value={formData.usage_limit} onChange={e => setFormData({ ...formData, usage_limit: parseInt(e.target.value) })} className="h-11 w-full rounded-lg border border-slate-300 px-4" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
                    <div className="flex h-11 items-center px-4 rounded-lg border border-slate-300">
                      <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="h-5 w-5 mr-3 accent-[#EFB036]" />
                      <span className="text-sm font-medium">{formData.is_active ? 'Aktif' : 'Tidak Aktif'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">URL Gambar (Opsional)</label>
                  <input type="url" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://example.com/promo.jpg" className="h-11 w-full rounded-lg border border-slate-300 px-4" />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button type="button" onClick={handleCloseModal} disabled={isSubmitting} className="flex-1 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl bg-[#EFB036] px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-[#dfa028] disabled:opacity-50">{isSubmitting ? 'Menyimpan...' : (editingPromo ? 'Simpan' : 'Tambah')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
