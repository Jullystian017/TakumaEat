'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, Bell, LayoutDashboard, Megaphone, Settings, ShoppingCart, Store, Users, UtensilsCrossed, Save, Globe, Palette, Shield, Mail, CreditCard, Smartphone, MapPin, Clock, DollarSign, Percent } from 'lucide-react';

interface SettingsClientProps {
  displayName: string;
  displayNameInitial: string;
  userEmail: string;
}

export default function SettingsClient({ displayName, displayNameInitial, userEmail }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'payment' | 'notification' | 'security'>('general');
  const [isSaving, setIsSaving] = useState(false);

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    restaurantName: 'TakumaEat',
    email: 'admin@takumaeat.com',
    phone: '021-12345678',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    timezone: 'Asia/Jakarta',
    currency: 'IDR',
    language: 'id'
  });

  // Appearance Settings State
  const [appearanceSettings, setAppearanceSettings] = useState({
    primaryColor: '#EFB036',
    secondaryColor: '#000000',
    theme: 'light',
    logo: '/logotakuma.png'
  });

  // Payment Settings State
  const [paymentSettings, setPaymentSettings] = useState({
    enableCash: true,
    enableCard: true,
    enableEwallet: true,
    taxRate: 10,
    serviceCharge: 5
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderAlerts: true,
    lowStockAlerts: true,
    newUserAlerts: false
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5
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

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'notification', label: 'Notification', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    alert('Settings saved successfully!');
  };

  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white px-6 py-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12"><Image src="/logotakuma.png" alt="Logo" fill className="object-contain" /></div>
          <div><p className="text-xs uppercase tracking-[0.3em] text-slate-500">TakumaEat</p><p className="text-lg font-semibold">Admin Hub</p></div>
        </div>
        <nav className="mt-12 flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/admin/settings';
            return (<Link key={item.label} href={item.href} className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${isActive ? 'bg-[#EFB036]/10 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}>
              <item.icon className={`h-4 w-4 ${isActive ? 'text-[#EFB036]' : 'text-[#EFB036]'}`} /><span>{item.label}</span>
            </Link>);
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-6 py-5 backdrop-blur lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#EFB036]">System Settings</p>
              <h1 className="mt-2 text-2xl font-semibold md:text-3xl">Pengaturan</h1>
              <p className="mt-2 text-sm text-slate-600">Kelola pengaturan sistem dan preferensi aplikasi.</p>
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 px-6 py-10 lg:px-10">
          {/* Tabs */}
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-6 py-3 text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-[#EFB036] text-black shadow-md' : 'border border-slate-200 bg-white text-slate-600 hover:border-[#EFB036]/50'}`}>
                  <Icon className="h-4 w-4" />{tab.label}
                </button>
              );
            })}
          </div>

          {/* Settings Content */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-6 text-xl font-bold text-slate-900">General Settings</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Restaurant Name</label>
                      <input type="text" value={generalSettings.restaurantName} onChange={(e) => setGeneralSettings({ ...generalSettings, restaurantName: e.target.value })} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                      <input type="email" value={generalSettings.email} onChange={(e) => setGeneralSettings({ ...generalSettings, email: e.target.value })} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Phone</label>
                      <input type="tel" value={generalSettings.phone} onChange={(e) => setGeneralSettings({ ...generalSettings, phone: e.target.value })} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Timezone</label>
                      <select value={generalSettings.timezone} onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20">
                        <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                        <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                        <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Currency</label>
                      <select value={generalSettings.currency} onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20">
                        <option value="IDR">IDR - Indonesian Rupiah</option>
                        <option value="USD">USD - US Dollar</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Language</label>
                      <select value={generalSettings.language} onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20">
                        <option value="id">Bahasa Indonesia</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Address</label>
                      <textarea value={generalSettings.address} onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })} rows={3} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-6 text-xl font-bold text-slate-900">Appearance Settings</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Primary Color</label>
                      <div className="flex gap-3">
                        <input type="color" value={appearanceSettings.primaryColor} onChange={(e) => setAppearanceSettings({ ...appearanceSettings, primaryColor: e.target.value })} className="h-11 w-20 rounded-lg border border-slate-300 cursor-pointer" />
                        <input type="text" value={appearanceSettings.primaryColor} onChange={(e) => setAppearanceSettings({ ...appearanceSettings, primaryColor: e.target.value })} className="h-11 flex-1 rounded-lg border border-slate-300 bg-white px-4 text-sm focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Secondary Color</label>
                      <div className="flex gap-3">
                        <input type="color" value={appearanceSettings.secondaryColor} onChange={(e) => setAppearanceSettings({ ...appearanceSettings, secondaryColor: e.target.value })} className="h-11 w-20 rounded-lg border border-slate-300 cursor-pointer" />
                        <input type="text" value={appearanceSettings.secondaryColor} onChange={(e) => setAppearanceSettings({ ...appearanceSettings, secondaryColor: e.target.value })} className="h-11 flex-1 rounded-lg border border-slate-300 bg-white px-4 text-sm focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Theme</label>
                      <select value={appearanceSettings.theme} onChange={(e) => setAppearanceSettings({ ...appearanceSettings, theme: e.target.value })} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Logo Path</label>
                      <input type="text" value={appearanceSettings.logo} onChange={(e) => setAppearanceSettings({ ...appearanceSettings, logo: e.target.value })} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-6 text-xl font-bold text-slate-900">Payment Settings</h2>
                  <div className="space-y-6">
                    <div className="rounded-xl bg-slate-50 p-6">
                      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-600">Payment Methods</h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input type="checkbox" checked={paymentSettings.enableCash} onChange={(e) => setPaymentSettings({ ...paymentSettings, enableCash: e.target.checked })} className="h-5 w-5 rounded border-slate-300 text-[#EFB036] focus:ring-2 focus:ring-[#EFB036]/20" />
                          <span className="text-sm font-medium text-slate-700">Enable Cash Payment</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" checked={paymentSettings.enableCard} onChange={(e) => setPaymentSettings({ ...paymentSettings, enableCard: e.target.checked })} className="h-5 w-5 rounded border-slate-300 text-[#EFB036] focus:ring-2 focus:ring-[#EFB036]/20" />
                          <span className="text-sm font-medium text-slate-700">Enable Credit/Debit Card</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" checked={paymentSettings.enableEwallet} onChange={(e) => setPaymentSettings({ ...paymentSettings, enableEwallet: e.target.checked })} className="h-5 w-5 rounded border-slate-300 text-[#EFB036] focus:ring-2 focus:ring-[#EFB036]/20" />
                          <span className="text-sm font-medium text-slate-700">Enable E-Wallet (GoPay, OVO, Dana)</span>
                        </label>
                      </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Tax Rate (%)</label>
                        <div className="relative">
                          <input type="number" value={paymentSettings.taxRate} onChange={(e) => setPaymentSettings({ ...paymentSettings, taxRate: Number(e.target.value) })} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 pr-10 text-sm focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20" />
                          <Percent className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Service Charge (%)</label>
                        <div className="relative">
                          <input type="number" value={paymentSettings.serviceCharge} onChange={(e) => setPaymentSettings({ ...paymentSettings, serviceCharge: Number(e.target.value) })} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 pr-10 text-sm focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20" />
                          <Percent className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notification' && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-6 text-xl font-bold text-slate-900">Notification Settings</h2>
                  <div className="space-y-6">
                    <div className="rounded-xl bg-slate-50 p-6">
                      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-600">Notification Channels</h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input type="checkbox" checked={notificationSettings.emailNotifications} onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })} className="h-5 w-5 rounded border-slate-300 text-[#EFB036] focus:ring-2 focus:ring-[#EFB036]/20" />
                          <span className="text-sm font-medium text-slate-700">Email Notifications</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" checked={notificationSettings.smsNotifications} onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })} className="h-5 w-5 rounded border-slate-300 text-[#EFB036] focus:ring-2 focus:ring-[#EFB036]/20" />
                          <span className="text-sm font-medium text-slate-700">SMS Notifications</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" checked={notificationSettings.pushNotifications} onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })} className="h-5 w-5 rounded border-slate-300 text-[#EFB036] focus:ring-2 focus:ring-[#EFB036]/20" />
                          <span className="text-sm font-medium text-slate-700">Push Notifications</span>
                        </label>
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-6">
                      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-600">Alert Types</h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input type="checkbox" checked={notificationSettings.orderAlerts} onChange={(e) => setNotificationSettings({ ...notificationSettings, orderAlerts: e.target.checked })} className="h-5 w-5 rounded border-slate-300 text-[#EFB036] focus:ring-2 focus:ring-[#EFB036]/20" />
                          <span className="text-sm font-medium text-slate-700">New Order Alerts</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" checked={notificationSettings.lowStockAlerts} onChange={(e) => setNotificationSettings({ ...notificationSettings, lowStockAlerts: e.target.checked })} className="h-5 w-5 rounded border-slate-300 text-[#EFB036] focus:ring-2 focus:ring-[#EFB036]/20" />
                          <span className="text-sm font-medium text-slate-700">Low Stock Alerts</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" checked={notificationSettings.newUserAlerts} onChange={(e) => setNotificationSettings({ ...notificationSettings, newUserAlerts: e.target.checked })} className="h-5 w-5 rounded border-slate-300 text-[#EFB036] focus:ring-2 focus:ring-[#EFB036]/20" />
                          <span className="text-sm font-medium text-slate-700">New User Registration Alerts</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-6 text-xl font-bold text-slate-900">Security Settings</h2>
                  <div className="space-y-6">
                    <div className="rounded-xl bg-slate-50 p-6">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" checked={securitySettings.twoFactorAuth} onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })} className="h-5 w-5 rounded border-slate-300 text-[#EFB036] focus:ring-2 focus:ring-[#EFB036]/20" />
                        <div>
                          <span className="block text-sm font-semibold text-slate-700">Enable Two-Factor Authentication</span>
                          <span className="text-xs text-slate-500">Add an extra layer of security to admin accounts</span>
                        </div>
                      </label>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Session Timeout (minutes)</label>
                        <input type="number" value={securitySettings.sessionTimeout} onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: Number(e.target.value) })} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20" />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Password Expiry (days)</label>
                        <input type="number" value={securitySettings.passwordExpiry} onChange={(e) => setSecuritySettings({ ...securitySettings, passwordExpiry: Number(e.target.value) })} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20" />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Max Login Attempts</label>
                        <input type="number" value={securitySettings.loginAttempts} onChange={(e) => setSecuritySettings({ ...securitySettings, loginAttempts: Number(e.target.value) })} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
              <button type="button" className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Reset</button>
              <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 rounded-xl bg-[#EFB036] px-6 py-3 text-sm font-semibold text-black hover:bg-[#dfa028] disabled:opacity-50">
                <Save className="h-4 w-4" />{isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
