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
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Tag,
  X,
  Save
} from 'lucide-react';

interface MenuClientProps {
  displayName: string;
  displayNameInitial: string;
  userEmail: string;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'Available' | 'Out of Stock' | 'Hidden';
  image: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  color: string;
  icon: string;
}

export default function MenuClient({ displayName, displayNameInitial, userEmail }: MenuClientProps) {
  const [activeTab, setActiveTab] = useState<'menu' | 'categories'>('menu');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Category Management States
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

  const categoryNames = ['All', ...categories.map(c => c.name)];

  // Category Management Functions
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
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, ...formData }
          : cat
      ));
    } else {
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

  const handleDeleteCategory = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: 'M001',
      name: 'Takoyaki Supreme',
      category: 'Appetizer',
      price: 45_000,
      stock: 50,
      status: 'Available',
      image: '/menu/takoyaki.jpg',
      description: 'Takoyaki dengan topping premium dan saus spesial'
    },
    {
      id: 'M002',
      name: 'Signature Ramen',
      category: 'Main Course',
      price: 65_000,
      stock: 30,
      status: 'Available',
      image: '/menu/ramen.jpg',
      description: 'Ramen dengan kuah kental dan topping lengkap'
    },
    {
      id: 'M003',
      name: 'Sushi Platter',
      category: 'Main Course',
      price: 85_000,
      stock: 20,
      status: 'Available',
      image: '/menu/sushi.jpg',
      description: 'Kombinasi sushi pilihan dengan wasabi dan jahe'
    },
    {
      id: 'M004',
      name: 'Bento Box',
      category: 'Main Course',
      price: 55_000,
      stock: 0,
      status: 'Out of Stock',
      image: '/menu/bento.jpg',
      description: 'Paket bento dengan nasi, lauk, dan sayuran'
    },
    {
      id: 'M005',
      name: 'Matcha Ice Cream',
      category: 'Dessert',
      price: 35_000,
      stock: 40,
      status: 'Available',
      image: '/menu/matcha.jpg',
      description: 'Es krim matcha premium dari Jepang'
    },
    {
      id: 'M006',
      name: 'Green Tea',
      category: 'Beverage',
      price: 25_000,
      stock: 100,
      status: 'Available',
      image: '/menu/greentea.jpg',
      description: 'Teh hijau hangat atau dingin'
    }
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            const isActive = item.href === '/admin/menu';
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
              <p className="text-xs uppercase tracking-[0.3em] text-[#EFB036]">Menu Management</p>
              <h1 className="mt-2 text-2xl font-semibold md:text-3xl">Kelola Menu TakumaEat</h1>
              <p className="mt-2 text-sm text-slate-600">
                Tambah, edit, atau hapus menu makanan dan minuman yang tersedia.
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
          {/* Tabs */}
          <div className="mb-8 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                activeTab === 'menu'
                  ? 'bg-[#EFB036] text-black shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <UtensilsCrossed className="h-4 w-4" />
              Menu Items
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                activeTab === 'categories'
                  ? 'bg-[#EFB036] text-black shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Tag className="h-4 w-4" />
              Categories
            </button>
          </div>

          {/* Menu Tab Content */}
          {activeTab === 'menu' && (
            <>
              {/* Action Bar */}
              <div className="mb-8 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari menu berdasarkan nama..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm shadow-sm transition-all placeholder:text-slate-400 focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20"
                    />
                  </div>
                  <button className="flex h-12 items-center gap-2 rounded-xl bg-[#EFB036] px-6 text-sm font-semibold text-black shadow-md transition-all hover:bg-[#dfa028] hover:shadow-lg">
                    <Plus className="h-5 w-5" />
                    Tambah Menu
                  </button>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Filter className="h-4 w-4" />
                    <span>Kategori:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categoryNames.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#EFB036] text-black shadow-md'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-[#EFB036]/50 hover:bg-[#EFB036]/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between text-sm">
              <p className="text-slate-600">
                Menampilkan <span className="font-semibold text-slate-900">{filteredMenuItems.length}</span> menu
                {selectedCategory !== 'All' && (
                  <span className="text-slate-500"> dalam kategori {selectedCategory}</span>
                )}
              </p>
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMenuItems.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-lg"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute right-3 top-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold shadow-md ${
                        item.status === 'Available'
                          ? 'bg-emerald-500 text-white'
                          : item.status === 'Out of Stock'
                            ? 'bg-red-500 text-white'
                            : 'bg-slate-500 text-white'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-xs font-medium text-white/80">{item.category}</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Harga</p>
                      <p className="text-lg font-bold text-[#EFB036]">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Stok</p>
                      <p className="text-lg font-bold text-slate-900">{item.stock}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-all hover:bg-slate-50">
                      <Eye className="h-4 w-4" />
                      Detail
                    </button>
                    <button className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-[#EFB036] text-sm font-medium text-black transition-all hover:bg-[#dfa028]">
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button className="flex h-9 items-center justify-center rounded-lg border border-red-200 bg-white px-3 text-red-600 transition-all hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

              {/* Empty State */}
              {filteredMenuItems.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16">
                  <UtensilsCrossed className="h-16 w-16 text-slate-300" />
                  <p className="mt-4 text-lg font-semibold text-slate-900">Tidak ada menu ditemukan</p>
                  <p className="mt-2 text-sm text-slate-500">Coba ubah filter atau kata kunci pencarian</p>
                </div>
              )}
            </>
          )}

          {/* Categories Tab Content */}
          {activeTab === 'categories' && (
            <>
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
                          onClick={() => handleDeleteCategory(category.id)}
                          className="flex h-9 items-center justify-center rounded-lg border border-red-200 bg-white px-3 text-red-600 transition-all hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Category Modal */}
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
