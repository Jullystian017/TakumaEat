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
  Tag,
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
  Shield,
  Palette,
  CreditCard,
  Globe,
  Save,
  Moon,
  Sun,
  Lock,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import AdminNotificationDropdown from '@/app/components/AdminNotificationDropdown';
import { StatusToast, type ToastType } from '@/app/components/AdminActionUI';

interface SettingsClientProps {
  displayName: string;
  displayNameInitial: string;
  userEmail: string;
}

export default function SettingsClient({ displayName, displayNameInitial, userEmail }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const router = useRouter();

  // Settings State
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ isOpen: boolean, message: string, type: ToastType }>({
    isOpen: false,
    message: '',
    type: 'success'
  });

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

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ isOpen: true, message, type });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      showToast('Pengaturan berhasil disimpan ke sistem');
    }, 1000);
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

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notification', icon: Bell }
  ];

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
            const isActive = item.href === '/admin/settings';
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
                  placeholder="Cari pengaturan..."
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
          <div className="mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EFB036]">System Engine</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Konfigurasi Platform</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">Kelola preferensi aplikasi, keamanan, dan integrasi pembayaran.</p>
          </div>

          <div className="flex flex-col gap-10 lg:flex-row">
            {/* Tabs Nav */}
            <div className="w-full lg:w-72 shrink-0">
              <div className="sticky top-24 space-y-2 p-2 rounded-[2rem] bg-white border border-slate-100 shadow-sm">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest transition-all",
                      activeTab === tab.id ? "bg-slate-900 text-[#EFB036] shadow-xl" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <tab.icon className={cn("h-5 w-5", activeTab === tab.id ? "text-[#EFB036]" : "text-slate-400")} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Area */}
            <div className="flex-1">
              <motion.form
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleSave}
                className="rounded-[3rem] border border-slate-200 bg-white p-8 lg:p-12 shadow-sm"
              >
                <div className="mb-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 capitalize tracking-tight">{activeTab} Settings</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Lakukan perubahan pada modul {activeTab}</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">
                    {tabs.find(t => t.id === activeTab)?.icon({ size: 24 })}
                  </div>
                </div>

                <div className="space-y-8">
                  {activeTab === 'general' && (
                    <>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Restaurant Name</label>
                        <input type="text" defaultValue="TakumaEat Official" className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 text-sm font-bold focus:border-[#EFB036] focus:bg-white focus:outline-none" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Support Email</label>
                        <input type="email" defaultValue="support@takumaeat.com" className="h-14 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 text-sm font-bold focus:border-[#EFB036] focus:bg-white focus:outline-none" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">App Description</label>
                        <textarea rows={4} className="w-full rounded-[2rem] border border-slate-100 bg-slate-50 p-6 text-sm font-bold focus:border-[#EFB036] focus:bg-white focus:outline-none">Platform pesan antar makanan premium dengan cita rasa otentik Jepang.</textarea>
                      </div>
                    </>
                  )}

                  {activeTab === 'appearance' && (
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="p-6 rounded-[2rem] border border-slate-100 bg-slate-50/50 flex flex-col items-center gap-4 group cursor-pointer hover:border-[#EFB036] transition-all text-slate-900">
                        <div className="h-16 w-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform"><Sun size={32} /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Light Mode</span>
                        <CheckCircle2 size={16} className="text-[#EFB036]" />
                      </div>
                      <div className="p-6 rounded-[2rem] border border-slate-100 bg-slate-50/50 flex flex-col items-center gap-4 group cursor-pointer hover:border-slate-900 transition-all opacity-50 text-slate-900">
                        <div className="h-16 w-16 rounded-2xl bg-slate-900 shadow-sm flex items-center justify-center text-[#EFB036] group-hover:scale-110 transition-transform"><Moon size={32} /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Dark Mode</span>
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <div className="p-6 rounded-[2.5rem] bg-amber-50 border border-amber-100 flex gap-4">
                        <Lock className="text-amber-600 shrink-0" size={24} />
                        <div>
                          <p className="text-xs font-black text-amber-900 uppercase tracking-widest">Advanced Protection</p>
                          <p className="text-[10px] font-medium text-amber-700 leading-relaxed mt-1">Kami merekomendasikan untuk mengganti password secara berkala setiap 90 hari untuk menjaga integritas data dashboard.</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Current Authentication Method</label>
                        <div className="h-14 w-full flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-6">
                          <span className="text-sm font-bold text-slate-900">NextAuth.js (Session Cookies)</span>
                          <Smartphone size={16} className="text-[#EFB036]" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fallback for other tabs */}
                  {['payment', 'notifications'].includes(activeTab) && (
                    <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Module configuration coming soon</p>
                    </div>
                  )}

                  <div className="pt-10 border-t border-slate-50">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex w-full items-center justify-center gap-3 rounded-[2rem] bg-slate-900 py-5 text-xs font-black uppercase tracking-widest text-[#EFB036] shadow-2xl shadow-slate-900/20 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {isSaving ? <span className="h-5 w-5 border-2 border-white/20 border-t-[#EFB036] rounded-full animate-spin" /> : <Save size={18} />}
                      {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </div>
              </motion.form>
            </div>
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
                  <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-4 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-[0.1em]", item.href === '/admin/settings' ? 'bg-slate-900 text-[#EFB036]' : 'text-slate-500')}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast.isOpen && <StatusToast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, isOpen: false })} />}
      </AnimatePresence>
    </div>
  );
}
