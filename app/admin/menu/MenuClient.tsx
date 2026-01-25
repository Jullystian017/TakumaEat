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
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Tag,
  X,
  Save,
  Menu,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface MenuClientProps {
  displayName: string;
  displayNameInitial: string;
  userEmail: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  itemCount?: number;
}

export default function MenuClient({ displayName, displayNameInitial, userEmail }: MenuClientProps) {
  const [activeTab, setActiveTab] = useState<'menu' | 'categories'>('menu');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal States
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Forms
  const [menuForm, setMenuForm] = useState({
    name: '',
    category_id: '',
    price: 0,
    stock: 0,
    description: '',
    image_url: '',
    status: 'available'
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: '#EFB036',
    icon: '🍽️'
  });

  async function refreshData() {
    try {
      setLoading(true);
      const [menuRes, catRes] = await Promise.all([
        fetch('/api/admin/menu'),
        fetch('/api/admin/categories')
      ]);
      const menuData = await menuRes.json();
      const catData = await catRes.json();

      if (menuData.menuItems) setMenuItems(menuData.menuItems);
      if (catData.categories) setCategories(catData.categories);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
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

  const colorOptions = [
    { name: 'Orange', value: '#EFB036' }, { name: 'Red', value: '#EF4444' },
    { name: 'Pink', value: '#EC4899' }, { name: 'Purple', value: '#A855F7' },
    { name: 'Blue', value: '#3B82F6' }, { name: 'Green', value: '#10B981' },
    { name: 'Yellow', value: '#F59E0B' }, { name: 'Slate', value: '#64748B' }
  ];

  const iconOptions = ['🍽️', '🥟', '🍜', '🍱', '🍰', '🍵', '🍕', '🍔', '🍣', '🥗', '🍖', '🥤'];

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
      const method = editingCategory ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });
      if (res.ok) {
        await refreshData();
        setIsCategoryModalOpen(false);
        showToast(`Kategori berhasil ${editingCategory ? 'diperbarui' : 'ditambahkan'}`, 'success');
      } else {
        const data = await res.json();
        showToast(data.message || 'Gagal menyimpan kategori', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan sistem', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const url = editingItem ? `/api/admin/menu/${editingItem.id}` : '/api/admin/menu';
      const method = editingItem ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuForm)
      });
      if (res.ok) {
        await refreshData();
        setIsMenuModalOpen(false);
        showToast(`Menu berhasil ${editingItem ? 'diperbarui' : 'ditambahkan'}`, 'success');
      } else {
        const data = await res.json();
        showToast(data.message || 'Gagal menyimpan menu', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan sistem', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: string, type: 'menu' | 'category') => {
    if (!confirm(`Hapus ${type === 'menu' ? 'menu' : 'kategori'} ini?`)) return;
    try {
      const url = type === 'menu' ? `/api/admin/menu/${id}` : `/api/admin/categories/${id}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        await refreshData();
        showToast(`${type === 'menu' ? 'Menu' : 'Kategori'} berhasil dihapus`, 'success');
      } else {
        showToast('Gagal menghapus data', 'error');
      }
    } catch (err) {
      showToast('Kesalahan sistem saat menghapus', 'error');
    }
  };

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.categories?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white px-6 py-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12"><Image src="/logotakuma.png" alt="Logo" fill className="object-contain" /></div>
          <div><p className="text-xs uppercase tracking-[0.3em] text-slate-500">TakumaEat</p><p className="text-lg font-semibold text-slate-900">Admin Hub</p></div>
        </div>
        <nav className="mt-12 flex-1 space-y-1">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className={cn("flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all", item.href === '/admin/menu' ? 'bg-[#EFB036]/10 text-slate-900' : 'text-slate-600 hover:bg-slate-50')}>
              <item.icon className={cn("h-4 w-4", item.href === '/admin/menu' ? 'text-[#EFB036]' : 'text-[#EFB036]')} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-6 py-5 backdrop-blur lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100"><Menu /></button>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#EFB036]">Menu Management</p>
              <h1 className="mt-1 text-xl lg:text-2xl font-semibold">Kelola Menu TakumaEat</h1>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold text-white font-bold">{displayNameInitial}</div>
            <div className="flex flex-col"><p className="text-sm font-bold">{displayName}</p><p className="text-xs text-slate-500">{userEmail}</p></div>
          </div>
        </header>

        <main className="flex-1 bg-slate-50 px-6 py-10 lg:px-10 overflow-y-auto">
          <div className="mb-8 flex gap-2 rounded-xl bg-white p-1 shadow-sm">
            <button onClick={() => setActiveTab('menu')} className={cn("flex-1 py-3 rounded-lg text-sm font-bold transition-all", activeTab === 'menu' ? 'bg-[#EFB036] text-black' : 'text-slate-500')}>Menu Items</button>
            <button onClick={() => setActiveTab('categories')} className={cn("flex-1 py-3 rounded-lg text-sm font-bold transition-all", activeTab === 'categories' ? 'bg-[#EFB036] text-black' : 'text-slate-500')}>Categories</button>
          </div>

          {activeTab === 'menu' ? (
            <>
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Cari menu..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 pl-12 pr-4 text-sm" />
                </div>
                <button onClick={() => { setEditingItem(null); setMenuForm({ name: '', category_id: categories[0]?.id || '', price: 0, stock: 0, description: '', image_url: '', status: 'available' }); setIsMenuModalOpen(true); }} className="flex h-12 items-center gap-2 rounded-xl bg-[#EFB036] px-6 text-sm font-bold text-black"><Plus /> Tambah Menu</button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredMenuItems.map(item => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="relative h-40 w-full mb-4 rounded-xl overflow-hidden bg-slate-100">
                      {item.image_url && <Image src={item.image_url} alt={item.name} fill className="object-cover" />}
                      <div className="absolute top-2 right-2"><span className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase text-white", item.status === 'available' ? 'bg-emerald-500' : 'bg-red-500')}>{item.status}</span></div>
                    </div>
                    <h3 className="font-bold text-slate-900">{item.name}</h3>
                    <p className="text-xs text-slate-500 mb-4">{item.categories?.name}</p>
                    <div className="flex justify-between items-center mb-4">
                      <div><p className="text-[10px] text-slate-400 uppercase">Harga</p><p className="font-bold text-brand-gold">{formatCurrency(item.price)}</p></div>
                      <div className="text-right"><p className="text-[10px] text-slate-400 uppercase">Stok</p><p className="font-bold">{item.stock}</p></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingItem(item); setMenuForm({ ...item, category_id: item.category_id }); setIsMenuModalOpen(true); }} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 text-xs font-bold transition-colors hover:bg-slate-50"><Edit className="h-3 w-3" /> Edit</button>
                      <button onClick={() => handleDeleteItem(item.id, 'menu')} className="px-3 py-2 rounded-lg border border-red-100 text-red-500 transition-colors hover:bg-red-50"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <button onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', description: '', color: '#EFB036', icon: '🍽️' }); setIsCategoryModalOpen(true); }} className="h-40 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-brand-gold hover:text-brand-gold transition-all"><Plus /> Tambah Kategori</button>
              {categories.map(cat => (
                <div key={cat.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col items-center">
                  <div className="text-4xl mb-4 p-4 rounded-full" style={{ backgroundColor: `${cat.color}15` }}>{cat.icon}</div>
                  <h3 className="font-bold">{cat.name}</h3>
                  <div className="mt-4 flex gap-2 w-full">
                    <button onClick={() => { setEditingCategory(cat); setCategoryForm(cat); setIsCategoryModalOpen(true); }} className="flex-1 py-2 rounded-lg border border-slate-200 text-xs font-bold transition-colors hover:bg-slate-50">Edit</button>
                    <button onClick={() => handleDeleteItem(cat.id, 'category')} className="px-3 py-2 rounded-lg border border-red-100 text-red-500 transition-colors hover:bg-red-50"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Menu Modal */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSaveMenu} className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingItem ? 'Edit Menu' : 'Tambah Menu Baru'}</h2>
              <button type="button" onClick={() => setIsMenuModalOpen(false)}><X /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="col-span-2"><label className="text-xs font-bold text-slate-400 uppercase">Nama Menu</label><input type="text" required value={menuForm.name} onChange={e => setMenuForm({ ...menuForm, name: e.target.value })} className="w-full h-11 border border-slate-200 rounded-lg px-4 mt-1" /></div>
              <div><label className="text-xs font-bold text-slate-400 uppercase">Kategori</label><select value={menuForm.category_id} onChange={e => setMenuForm({ ...menuForm, category_id: e.target.value })} className="w-full h-11 border border-slate-200 rounded-lg px-4 mt-1">{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label className="text-xs font-bold text-slate-400 uppercase">Harga</label><input type="number" required value={menuForm.price} onChange={e => setMenuForm({ ...menuForm, price: Number(e.target.value) })} className="w-full h-11 border border-slate-200 rounded-lg px-4 mt-1" /></div>
              <div><label className="text-xs font-bold text-slate-400 uppercase">Stok</label><input type="number" required value={menuForm.stock} onChange={e => setMenuForm({ ...menuForm, stock: Number(e.target.value) })} className="w-full h-11 border border-slate-200 rounded-lg px-4 mt-1" /></div>
              <div><label className="text-xs font-bold text-slate-400 uppercase">Status</label><select value={menuForm.status} onChange={e => setMenuForm({ ...menuForm, status: e.target.value })} className="w-full h-11 border border-slate-200 rounded-lg px-4 mt-1"><option value="available">Available</option><option value="out_of_stock">Out of Stock</option><option value="hidden">Hidden</option></select></div>
              <div className="col-span-2"><label className="text-xs font-bold text-slate-400 uppercase">Deskripsi</label><textarea value={menuForm.description} onChange={e => setMenuForm({ ...menuForm, description: e.target.value })} className="w-full h-24 border border-slate-200 rounded-lg p-4 mt-1"></textarea></div>
              <div className="col-span-2"><label className="text-xs font-bold text-slate-400 uppercase">Image URL</label><input type="text" value={menuForm.image_url} onChange={e => setMenuForm({ ...menuForm, image_url: e.target.value })} className="w-full h-11 border border-slate-200 rounded-lg px-4 mt-1" /></div>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className={cn(
                "w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                isSaving ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-brand-gold text-black shadow-lg shadow-brand-gold/20"
              )}
            >
              {isSaving ? <div className="h-5 w-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" /> : <><Save className="h-4 w-4" /> Simpan Menu</>}
            </button>
          </form>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSaveCategory} className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
              <button type="button" onClick={() => setIsCategoryModalOpen(false)}><X /></button>
            </div>
            <div className="space-y-4 mb-6">
              <div><label className="text-xs font-bold text-slate-400 uppercase">Nama Kategori</label><input type="text" required value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} className="w-full h-11 border border-slate-200 rounded-lg px-4 mt-1" /></div>
              <div><label className="text-xs font-bold text-slate-400 uppercase">Deskripsi</label><textarea value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} className="w-full h-20 border border-slate-200 rounded-lg p-4 mt-1"></textarea></div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Icon</label>
                <div className="grid grid-cols-6 gap-2 mt-1">{iconOptions.map(icon => <button key={icon} type="button" onClick={() => setCategoryForm({ ...categoryForm, icon })} className={cn("h-10 border border-slate-100 rounded-lg flex items-center justify-center grayscale hover:grayscale-0", categoryForm.icon === icon && 'border-brand-gold bg-brand-gold/10 grayscale-0')}>{icon}</button>)}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Warna</label>
                <div className="grid grid-cols-8 gap-2 mt-1">{colorOptions.map(col => <button key={col.value} type="button" onClick={() => setCategoryForm({ ...categoryForm, color: col.value })} className={cn("h-8 rounded-full", categoryForm.color === col.value && 'ring-2 ring-slate-900 ring-offset-2')} style={{ backgroundColor: col.value }} />)}</div>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className={cn(
                "w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                isSaving ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-brand-gold text-black shadow-lg shadow-brand-gold/20"
              )}
            >
              {isSaving ? <div className="h-5 w-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" /> : <><Save className="h-4 w-4" /> Simpan Kategori</>}
            </button>
          </form>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed inset-y-0 left-0 z-[70] w-72 bg-white px-6 py-10 lg:hidden shadow-2xl">
              <div className="flex items-center justify-between mb-10 text-slate-900">
                <div className="flex items-center gap-3"><div className="relative h-10 w-10"><Image src="/logotakuma.png" alt="Logo" fill className="object-contain" /></div><p className="text-lg font-bold">Admin Hub</p></div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full bg-slate-50 text-slate-400"><X className="h-5 w-5" /></button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-bold transition-all", item.href === '/admin/menu' ? 'bg-[#EFB036] text-black shadow-lg shadow-brand-gold/20' : 'text-slate-500 hover:bg-slate-50')}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] min-w-[320px]">
            <div className={cn("flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md", toast.type === 'success' ? "bg-emerald-500/90 text-white border border-emerald-400/20" : "bg-red-500/90 text-white border border-red-400/20")}>
              {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-100" /> : <AlertCircle className="h-5 w-5 shrink-0 text-red-100" />}
              <p className="text-sm font-bold tracking-wide">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
