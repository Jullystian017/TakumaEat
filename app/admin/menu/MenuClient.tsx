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
  Filter,
  Plus,
  Trash2,
  X,
  Clock,
  LogOut,
  ChevronLeft,
  ChevronDown,
  Menu,
  Image as ImageIcon,
  Edit,
  Save,
  CheckCircle2,
  Layers,
  Type,
  Coins,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import AdminNotificationDropdown from '@/app/components/AdminNotificationDropdown';
import { ConfirmationModal, StatusToast, type ToastType } from '@/app/components/AdminActionUI';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category_id: string;
  image_url: string;
  description: string;
  stock: number;
  status: 'available' | 'out_of_stock' | 'discontinued';
  highlights: string[];
  calories?: number;
  categories?: { name: string };
}

interface Category {
  id: string;
  name: string;
}

interface MenuClientProps {
  displayName: string;
  displayNameInitial: string;
  userEmail: string;
  menuItems?: MenuItem[];
  categories?: Category[];
}

export default function MenuClient({ displayName, displayNameInitial, userEmail, menuItems: initialMenuItems = [], categories: initialCategories = [] }: MenuClientProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(initialMenuItems.length === 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    category_id: '',
    image_url: '',
    description: '',
    stock: 0,
    status: 'available' as MenuItem['status'],
    highlights: [] as string[],
    calories: undefined as number | undefined
  });

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
    targetId: string | null;
    targetType: 'menu' | 'category';
    title: string;
    message: string;
  }>({
    isOpen: false,
    targetId: null,
    targetType: 'menu',
    title: '',
    message: ''
  });

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ isOpen: true, message, type });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [menuRes, catRes] = await Promise.all([
        fetch('/api/admin/menu'),
        fetch('/api/admin/categories')
      ]);
      const [menuData, catData] = await Promise.all([menuRes.json(), catRes.json()]);
      setMenuItems(menuData.menuItems || []);
      setCategories(catData.categories || []);
    } catch (e) {
      showToast('Gagal memuat data menu', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        price: item.price,
        category_id: item.category_id,
        image_url: item.image_url || '',
        description: item.description || '',
        stock: item.stock || 0,
        status: item.status || 'available',
        highlights: item.highlights || [],
        calories: item.calories
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        price: 0,
        category_id: categories[0]?.id || '',
        image_url: '',
        description: '',
        stock: 100,
        status: 'available',
        highlights: [],
        calories: undefined
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingItem ? `/api/admin/menu/${editingItem.id}` : '/api/admin/menu';
      const method = editingItem ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Operation failed');
      }

      await fetchData();
      showToast(editingItem ? 'Item berhasil diperbarui' : 'Item baru ditambahkan');
      handleCloseModal();
    } catch (error: any) {
      showToast(error.message || 'Gagal menyimpan item', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      targetId: id,
      targetType: 'menu',
      title: 'Hapus Item',
      message: `Hapus menu ${name} secara permanen?`
    });
  };

  const confirmDelete = async () => {
    if (!confirmModal.targetId) return;
    try {
      const endpoint = confirmModal.targetType === 'menu' ? `/api/admin/menu/${confirmModal.targetId}` : `/api/admin/categories/${confirmModal.targetId}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      if (confirmModal.targetType === 'menu') {
        setMenuItems(menuItems.filter(p => p.id !== confirmModal.targetId));
      } else {
        setCategories(categories.filter(c => c.id !== confirmModal.targetId));
      }
      showToast('Berhasil dihapus');
    } catch (e) {
      showToast('Gagal menghapus', 'error');
    } finally {
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category_id === selectedCategory;
    return matchesSearch && matchesCat;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);

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
            const isActive = item.href === '/admin/menu';
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
                  placeholder="Cari menu TakumaEat..."
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
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EFB036]">Catalog</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Daftar Menu</h1>
              <p className="mt-2 text-sm font-medium text-slate-500">Kelola item menu dan kategori produk TakumaEat.</p>
            </div>
            <div className="mt-6 flex gap-3 lg:mt-0">
              <button onClick={() => handleOpenModal()} className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-[#EFB036] shadow-xl transition-all active:scale-95"><Plus size={16} /> Item Baru</button>
              <Link href="/admin/categories" className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-slate-900 transition-all"><Layers size={16} /> Kategori Pelengkap</Link>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                selectedCategory === 'all'
                  ? "bg-slate-900 text-[#EFB036] shadow-slate-900/10"
                  : "bg-white text-slate-500 hover:text-slate-900 border border-slate-100"
              )}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                  selectedCategory === cat.id
                    ? "bg-slate-900 text-[#EFB036] shadow-slate-900/10"
                    : "bg-white text-slate-500 hover:text-slate-900 border border-slate-100"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-[2.5rem] border border-slate-200 bg-white p-8 space-y-6">
                  <div className="h-48 bg-slate-100 rounded-3xl" />
                  <div className="space-y-3">
                    <div className="h-6 w-3/4 bg-slate-100 rounded-lg" />
                    <div className="h-4 w-full bg-slate-100 rounded-lg" />
                  </div>
                </div>
              ))
            ) : filteredItems.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No items found</div>
            ) : filteredItems.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all hover:shadow-2xl flex flex-col text-slate-900">
                <div className="relative h-40 w-full overflow-hidden">
                  <Image src={item.image_url || '/placeholder.png'} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-x-0 top-0 p-4 flex justify-between items-start">
                    <span className="text-[9px] font-black uppercase tracking-tight text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/20">{item.categories?.name}</span>
                    {item.stock < 10 && (
                      <span className="text-[9px] font-black uppercase tracking-tight text-white bg-red-500 px-2.5 py-1 rounded-lg shadow-lg">Low Stock</span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <div className="flex flex-col gap-1">
                      <p className="text-xl font-black text-white">Rp{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-base font-black text-slate-900 mb-1 truncate group-hover:text-[#EFB036] transition-colors">{item.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 line-clamp-2 mb-4 flex-1 italic">{item.description}</p>

                  <div className="mb-4 grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Stock</p>
                      <p className="text-xs font-black text-slate-900">{item.stock} <span className="text-[8px] text-slate-400">Unit</span></p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Status</p>
                      <p className={cn("text-[8px] font-black uppercase tracking-tight", item.status === 'available' ? 'text-emerald-500' : 'text-red-500')}>{item.status.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center gap-2">
                    <button onClick={() => handleOpenModal(item)} className="h-10 flex-1 rounded-xl bg-slate-900 text-[9px] font-black uppercase tracking-widest text-[#EFB036] transition-all active:scale-95">Edit Item</button>
                    <button onClick={() => handleDeleteItem(item.id, item.name)} className="h-10 w-10 flex items-center justify-center rounded-xl border border-red-50 bg-white text-red-500 transition-all hover:bg-red-50 hover:border-red-100 active:scale-95"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
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
                  <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-4 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-[0.1em]", item.href === '/admin/menu' ? 'bg-slate-900 text-[#EFB036]' : 'text-slate-500')}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Management Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl rounded-[3rem] bg-white shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#EFB036]">Product Catalog</p>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">{editingItem ? 'Update' : 'New'} Menu Item</h2>
                </div>
                <button onClick={handleCloseModal} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Item Name</label>
                    <div className="relative">
                      <Type className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Wagyu Beef Ramen" required className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 pl-14 pr-6 text-sm font-bold focus:border-[#EFB036] focus:bg-white focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Category</label>
                    <div className="relative">
                      <Layers className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} required className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 pl-14 pr-6 text-sm font-bold focus:border-[#EFB036] focus:bg-white focus:outline-none appearance-none">
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Price (IDR)</label>
                    <div className="relative">
                      <Coins className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })} required className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 pl-14 pr-6 text-sm font-bold focus:border-[#EFB036] focus:bg-white focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Initial Stock</label>
                    <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })} required className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 text-sm font-bold focus:border-[#EFB036] focus:bg-white focus:outline-none" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Image URL</label>
                  <div className="flex gap-4">
                    <div className="h-14 w-14 shrink-0 rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center">
                      {formData.image_url ? <Image src={formData.image_url} alt="Preview" width={56} height={56} className="object-cover" /> : <ImageIcon className="text-slate-300" />}
                    </div>
                    <input type="url" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." className="h-14 flex-1 rounded-2xl border border-slate-100 bg-slate-50 px-6 text-sm font-bold focus:border-[#EFB036] focus:bg-white focus:outline-none" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Description</label>
                  <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe this dish..." className="w-full rounded-3xl border border-slate-100 bg-slate-50 p-6 text-sm font-bold focus:border-[#EFB036] focus:bg-white focus:outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Status</label>
                    <div className="flex gap-2">
                      {(['available', 'out_of_stock'] as const).map(s => (
                        <button key={s} type="button" onClick={() => setFormData({ ...formData, status: s })} className={cn("flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all", formData.status === s ? 'bg-slate-900 text-[#EFB036]' : 'bg-slate-50 text-slate-400 hover:bg-slate-100')}>
                          {s.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Calories (Optional)</label>
                    <input type="number" value={formData.calories || ''} onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || undefined })} placeholder="e.g. 450" className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 px-5 text-sm font-bold focus:border-[#EFB036] focus:bg-white focus:outline-none" />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex gap-4">
                  <button type="button" disabled={isSubmitting} onClick={handleCloseModal} className="flex h-16 flex-1 items-center justify-center rounded-2xl border border-slate-100 bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:bg-slate-50 disabled:opacity-50">Cancel Action</button>
                  <button type="submit" disabled={isSubmitting} className="flex h-16 flex-1 items-center justify-center gap-3 rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-[#EFB036] shadow-2xl shadow-slate-900/20 disabled:opacity-50">
                    {isSubmitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#EFB036] border-t-transparent" />
                    ) : (
                      <>
                        <Save size={18} />
                        {editingItem ? 'Update Menu Item' : 'Create Product'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} onConfirm={confirmDelete} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} type="danger" />
      <AnimatePresence>{toast.isOpen && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, isOpen: false })} />}</AnimatePresence>
    </div>
  );
}
