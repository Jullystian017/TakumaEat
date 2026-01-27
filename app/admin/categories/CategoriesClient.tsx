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
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Tag,
  Search,
  Menu,
  ChevronLeft,
  LogOut,
  ChevronDown,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import AdminNotificationDropdown from '@/app/components/AdminNotificationDropdown';
import { ConfirmationModal, StatusToast, type ToastType } from '@/app/components/AdminActionUI';

interface CategoriesClientProps {
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
  image_url: string;
  priority: number;
  _count?: {
    menu_items: number;
  };
}

export default function CategoriesClient({ displayName, displayNameInitial, userEmail }: CategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#EFB036',
    icon: '🍽️',
    image_url: '',
    priority: 0
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const [toast, setToast] = useState<{ isOpen: boolean, message: string, type: ToastType }>({
    isOpen: false,
    message: '',
    type: 'success'
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    catId: string | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    catId: null,
    title: '',
    message: ''
  });

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      showToast('Gagal memuat kategori', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ isOpen: true, message, type });
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

  const colorOptions = [
    { name: 'Orange', value: '#EFB036' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Purple', value: '#A855F7' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Slate', value: '#64748B' }
  ];

  const iconOptions = ['🍽️', '🥟', '🍜', '🍱', '🍰', '🍵', '🍕', '🍔', '🍣', '🥗', '🍖', '🥤'];

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color || '#EFB036',
        icon: category.icon || '🍽️',
        image_url: category.image_url || '',
        priority: category.priority || 0
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        color: '#EFB036',
        icon: '🍽️',
        image_url: '',
        priority: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Operation failed');
      }

      await fetchCategories();
      showToast(editingCategory ? 'Kategori berhasil diperbarui' : 'Kategori baru ditambahkan');
      handleCloseModal();
    } catch (error: any) {
      showToast(error.message || 'Gagal menyimpan kategori', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    const cat = categories.find(c => c.id === id);
    setConfirmModal({
      isOpen: true,
      catId: id,
      title: 'Hapus Kategori',
      message: `Hapus kategori ${cat?.name || 'ini'}? Tindakan ini tidak dapat dibatalkan.`,
    });
  };

  const confirmDelete = async () => {
    if (!confirmModal.catId) return;
    try {
      const res = await fetch(`/api/admin/categories/${confirmModal.catId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      setCategories(categories.filter(cat => cat.id !== confirmModal.catId));
      showToast('Kategori berhasil dihapus');
    } catch (error) {
      showToast('Gagal menghapus kategori', 'error');
    }
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

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
            const isActive = item.href === '/admin/categories';
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
                  placeholder="Cari kategori..."
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
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EFB036]">Organization</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Kategori Menu</h1>
              <p className="mt-2 text-sm font-medium text-slate-500">Kelompokkan menu Anda untuk mempermudah pelanggan dalam memilih.</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="mt-6 flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-[#EFB036] shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95 lg:mt-0"
            >
              <Plus size={16} /> Tambah Kategori
            </button>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-[2.5rem] border border-slate-200 bg-white p-8 space-y-6">
                  <div className="h-40 bg-slate-100 rounded-3xl" />
                  <div className="space-y-3">
                    <div className="h-6 w-1/2 bg-slate-100 rounded-lg" />
                    <div className="h-4 w-full bg-slate-100 rounded-lg" />
                  </div>
                </div>
              ))
            ) : categories.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Belum ada kategori terdaftar</p>
              </div>
            ) : categories.map((category) => (
              <motion.div
                key={category.id}
                layout
                className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl"
              >
                <div
                  className="flex h-40 items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at center, ${category.color} 1px, transparent 1px)`, backgroundSize: '12px 12px' }} />
                  {category.image_url ? (
                    <Image src={category.image_url} alt={category.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <span className="text-7xl group-hover:scale-110 transition-transform duration-500">{category.icon}</span>
                  )}
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="text-base font-black text-slate-900 tracking-tight group-hover:text-[#EFB036] transition-colors truncate pr-2">{category.name}</h3>
                      <div className="h-3 w-3 shrink-0 rounded-full shadow-inner" style={{ backgroundColor: category.color }} />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1 leading-relaxed">{category.description}</p>
                  </div>
                  <div className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Inventory</p>
                    <p className="text-xl font-black text-slate-900">{category._count?.menu_items || 0} <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-0.5">Products</span></p>
                  </div>
                  <div className="pt-4 border-t border-slate-50 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(category)}
                      className="h-10 flex-1 rounded-xl bg-slate-900 text-[9px] font-black uppercase tracking-widest text-[#EFB036] transition-all active:scale-95"
                    >
                      Edit Category
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="h-10 w-10 flex items-center justify-center rounded-xl border border-red-50 bg-white text-red-500 transition-all hover:bg-red-50 hover:border-red-100 active:scale-95"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
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
                  <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-4 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-[0.1em]", item.href === '/admin/categories' ? 'bg-slate-900 text-[#EFB036]' : 'text-slate-500')}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg rounded-[3rem] bg-white shadow-2xl flex flex-col overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#EFB036]">Classification</p>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">{editingCategory ? 'Update' : 'New'} Category</h2>
                </div>
                <button onClick={handleCloseModal} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto no-scrollbar max-h-[70vh]">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Category Identity</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Sushi & Sashimi" required className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 text-sm font-bold focus:border-[#EFB036] focus:bg-white focus:outline-none" />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Brief Description</label>
                  <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="What defines this category?" required className="w-full rounded-[2rem] border border-slate-100 bg-slate-50 p-6 text-sm font-bold focus:border-[#EFB036] focus:bg-white focus:outline-none" />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Display Image URL (Optional)</label>
                  <div className="flex gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden">
                      {formData.image_url ? (
                        <Image src={formData.image_url} alt="Preview" width={56} height={56} className="object-cover" />
                      ) : (
                        <ImageIcon className="text-slate-300" />
                      )}
                    </div>
                    <input type="url" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://example.com/image.jpg" className="h-14 flex-1 rounded-2xl border border-slate-100 bg-slate-50 px-6 text-sm font-bold focus:border-[#EFB036] focus:bg-white focus:outline-none" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Symbol / Icon</label>
                  <div className="grid grid-cols-6 gap-3">
                    {iconOptions.map((icon) => (
                      <button key={icon} type="button" onClick={() => setFormData({ ...formData, icon })} className={cn("flex h-14 items-center justify-center rounded-2xl border-2 text-2xl transition-all", formData.icon === icon ? 'border-[#EFB036] bg-[#EFB036]/5 scale-110 shadow-lg' : 'border-slate-50 bg-slate-50 hover:border-slate-200')}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between ml-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sort Priority</label>
                    <span className="text-[10px] font-black text-[#EFB036] bg-[#EFB036]/10 px-2 py-0.5 rounded-md">{formData.priority}</span>
                  </div>
                  <input type="range" min="0" max="100" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })} className="w-full accent-[#EFB036]" />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Brand Color</label>
                  <div className="grid grid-cols-4 gap-3">
                    {colorOptions.map((color) => (
                      <button key={color.value} type="button" onClick={() => setFormData({ ...formData, color: color.value })} className={cn("flex h-12 items-center justify-center rounded-[1.25rem] border-4 transition-all relative overflow-hidden", formData.color === color.value ? 'border-slate-900 scale-105' : 'border-transparent opacity-80 hover:opacity-100')} style={{ backgroundColor: color.value }}>
                        {formData.color === color.value && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><span className="text-white font-black text-xs">SELECTED</span></div>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex gap-4">
                  <button type="button" disabled={isSubmitting} onClick={handleCloseModal} className="flex h-14 flex-1 items-center justify-center rounded-2xl border border-slate-100 bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:bg-slate-50 disabled:opacity-50">Cancel Action</button>
                  <button type="submit" disabled={isSubmitting} className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-[#EFB036] shadow-2xl shadow-slate-900/20 disabled:opacity-50">
                    {isSubmitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#EFB036] border-t-transparent" />
                    ) : (
                      <>
                        <Save size={16} />
                        {editingCategory ? 'Update Kategori' : 'Create Category'}
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
