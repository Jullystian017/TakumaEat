'use client';

import { useState } from 'react';
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
  Edit,
  Trash2,
  X,
  Save,
  Tag
} from 'lucide-react';

interface CategoriesClientProps {
  displayName: string;
  displayNameInitial: string;
  userEmail: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  color: string;
  icon: string;
}

export default function CategoriesClient({ displayName, displayNameInitial, userEmail }: CategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: 'CAT001',
      name: 'Appetizer',
      description: 'Makanan pembuka untuk memulai hidangan',
      itemCount: 8,
      color: '#EF4444',
      icon: '🥟'
    },
    {
      id: 'CAT002',
      name: 'Main Course',
      description: 'Hidangan utama yang mengenyangkan',
      itemCount: 15,
      color: '#F59E0B',
      icon: '🍜'
    },
    {
      id: 'CAT003',
      name: 'Dessert',
      description: 'Makanan penutup yang manis',
      itemCount: 6,
      color: '#EC4899',
      icon: '🍰'
    },
    {
      id: 'CAT004',
      name: 'Beverage',
      description: 'Minuman segar dan hangat',
      itemCount: 10,
      color: '#3B82F6',
      icon: '🍵'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#EFB036',
    icon: '🍽️'
  });

  const navItems: { label: string; href: string; icon: LucideIcon }[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Menu', href: '/admin/menu', icon: UtensilsCrossed },
    { label: 'Categories', href: '/admin/categories', icon: Tag },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Promo', href: '/admin/promo', icon: Megaphone },
    { label: 'Branches', href: '/admin/branches', icon: Store },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
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
        description: category.description,
        color: category.color,
        icon: category.icon
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        color: '#EFB036',
        icon: '🍽️'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      color: '#EFB036',
      icon: '🍽️'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      // Update existing category
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, ...formData }
          : cat
      ));
    } else {
      // Add new category
      const newCategory: Category = {
        id: `CAT${String(categories.length + 1).padStart(3, '0')}`,
        name: formData.name,
        description: formData.description,
        color: formData.color,
        icon: formData.icon,
        itemCount: 0
      };
      setCategories([...categories, newCategory]);
    }
    
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white px-6 py-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12">
            <Image
              src="/logotakuma.png"
              alt="TakumaEat Logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">TakumaEat</p>
            <p className="text-lg font-semibold text-slate-900">Admin Hub</p>
          </div>
        </div>
        <nav className="mt-12 flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/admin/categories';
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#EFB036]/10 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon
                  className={`h-4 w-4 transition-colors duration-200 ${
                    isActive ? 'text-[#EFB036]' : 'text-[#EFB036] group-hover:text-[#f6c15d]'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Laporan Bulanan</p>
          <p className="mt-2 text-xs text-slate-600">Pantau laporan rinci untuk menjaga ritme pertumbuhan setiap cabang.</p>
          <button className="mt-4 h-9 w-full rounded-full bg-[#EFB036] px-4 text-xs font-semibold text-black hover:bg-[#dfa028]">
            Unduh PDF
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-6 py-5 backdrop-blur lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#EFB036]">Category Management</p>
              <h1 className="mt-2 text-2xl font-semibold md:text-3xl">Kelola Kategori Menu</h1>
              <p className="mt-2 text-sm text-slate-600">
                Tambah, edit, atau hapus kategori untuk mengorganisir menu dengan lebih baik.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:shadow"
              >
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">
                Total <span className="font-semibold text-slate-900">{categories.length}</span> kategori
              </p>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="flex h-12 items-center gap-2 rounded-xl bg-[#EFB036] px-6 text-sm font-semibold text-black shadow-md transition-all hover:bg-[#dfa028] hover:shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Tambah Kategori
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-lg"
              >
                <div 
                  className="flex h-32 items-center justify-center"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  <span className="text-6xl">{category.icon}</span>
                </div>
                <div className="p-5">
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900">{category.name}</h3>
                      <div 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{category.description}</p>
                  </div>
                  <div className="mb-4 rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">Total Menu</p>
                    <p className="text-xl font-bold text-slate-900">{category.itemCount}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenModal(category)}
                      className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-[#EFB036] text-sm font-medium text-black transition-all hover:bg-[#dfa028]"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(category.id)}
                      className="flex h-9 items-center justify-center rounded-lg border border-red-200 bg-white px-3 text-red-600 transition-all hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Appetizer"
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm transition-all focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi singkat kategori..."
                  rows={3}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition-all focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Icon
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`flex h-12 items-center justify-center rounded-lg border-2 text-2xl transition-all ${
                        formData.icon === icon
                          ? 'border-[#EFB036] bg-[#EFB036]/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Warna
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`flex h-12 items-center justify-center rounded-lg border-2 transition-all ${
                        formData.color === color.value
                          ? 'border-slate-900 ring-2 ring-slate-900 ring-offset-2'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                    >
                      {formData.color === color.value && (
                        <span className="text-white">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#EFB036] text-sm font-semibold text-black shadow-md transition-all hover:bg-[#dfa028]"
                >
                  <Save className="h-4 w-4" />
                  {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
