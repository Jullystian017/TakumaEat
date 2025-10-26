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
  Filter,
  Eye,
  Check,
  X,
  Clock,
  ChefHat,
  Package,
  Truck
} from 'lucide-react';

interface OrdersClientProps {
  displayName: string;
  displayNameInitial: string;
  userEmail: string;
}

interface Order {
  id: string;
  orderNumber: string;
  orderType: 'Delivery' | 'Takeaway';
  customer: {
    name: string;
    phone: string;
    address?: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'Menunggu' | 'Diproses' | 'Siap' | 'Dikirim' | 'Selesai' | 'Dibatalkan';
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderTime: string;
  pickupTime?: string;
  branch: string;
  deliveryFee?: number;
  notes?: string;
}

export default function OrdersClient({ displayName, displayNameInitial, userEmail }: OrdersClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedOrderType, setSelectedOrderType] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

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

  const statusOptions = ['All', 'Menunggu', 'Diproses', 'Siap', 'Dikirim', 'Selesai', 'Dibatalkan'];

  useEffect(() => {
    // Initialize orders with sample data
    setOrders([
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      orderType: 'Delivery',
      customer: {
        name: 'Budi Santoso',
        phone: '081234567890',
        address: 'Jl. Sudirman No. 123, Jakarta Pusat'
      },
      items: [
        { name: 'Takoyaki Supreme', quantity: 2, price: 45000 },
        { name: 'Signature Ramen', quantity: 1, price: 65000 }
      ],
      total: 170000,
      status: 'Diproses',
      paymentMethod: 'E-Wallet',
      paymentStatus: 'Paid',
      orderTime: '10:30 AM',
      branch: 'Jakarta Pusat',
      deliveryFee: 15000,
      notes: 'Tolong antarkan sebelum jam 12 siang'
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      orderType: 'Takeaway',
      customer: {
        name: 'Siti Aminah',
        phone: '081234567891'
      },
      items: [
        { name: 'Sushi Platter', quantity: 1, price: 85000 },
        { name: 'Green Tea', quantity: 2, price: 25000 }
      ],
      total: 135000,
      status: 'Siap',
      paymentMethod: 'Cash',
      paymentStatus: 'Pending',
      orderTime: '10:45 AM',
      pickupTime: '11:30 AM',
      branch: 'Jakarta Selatan',
      notes: 'Ambil sendiri di counter'
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      orderType: 'Delivery',
      customer: {
        name: 'Ahmad Rizki',
        phone: '081234567892',
        address: 'Jl. Thamrin No. 78, Jakarta Pusat'
      },
      items: [
        { name: 'Bento Box', quantity: 3, price: 55000 }
      ],
      total: 180000,
      status: 'Dikirim',
      paymentMethod: 'Credit Card',
      paymentStatus: 'Paid',
      orderTime: '11:00 AM',
      branch: 'Jakarta Pusat',
      deliveryFee: 15000
    },
    {
      id: '4',
      orderNumber: 'ORD-2024-004',
      orderType: 'Delivery',
      customer: {
        name: 'Dewi Lestari',
        phone: '081234567893',
        address: 'Jl. Kuningan No. 90, Jakarta Selatan'
      },
      items: [
        { name: 'Signature Ramen', quantity: 2, price: 65000 },
        { name: 'Matcha Ice Cream', quantity: 2, price: 35000 }
      ],
      total: 220000,
      status: 'Menunggu',
      paymentMethod: 'E-Wallet',
      paymentStatus: 'Pending',
      orderTime: '11:15 AM',
      branch: 'Jakarta Selatan',
      deliveryFee: 20000,
      notes: 'Jangan lupa sendok garpu'
    },
    {
      id: '5',
      orderNumber: 'ORD-2024-005',
      orderType: 'Takeaway',
      customer: {
        name: 'Eko Prasetyo',
        phone: '081234567894'
      },
      items: [
        { name: 'Takoyaki Supreme', quantity: 1, price: 45000 },
        { name: 'Green Tea', quantity: 1, price: 25000 }
      ],
      total: 70000,
      status: 'Selesai',
      paymentMethod: 'Cash',
      paymentStatus: 'Paid',
      orderTime: '09:30 AM',
      pickupTime: '10:00 AM',
      branch: 'Jakarta Selatan'
    },
    // Additional orders for pagination demo
    {
      id: '6',
      orderNumber: 'ORD-2024-006',
      orderType: 'Delivery',
      customer: { name: 'Rina Susanti', phone: '081234567895', address: 'Jl. Merdeka No. 15, Jakarta Pusat' },
      items: [{ name: 'Takoyaki Supreme', quantity: 3, price: 45000 }],
      total: 150000,
      status: 'Menunggu',
      paymentMethod: 'E-Wallet',
      paymentStatus: 'Paid',
      orderTime: '11:30 AM',
      branch: 'Jakarta Pusat',
      deliveryFee: 15000
    },
    {
      id: '7',
      orderNumber: 'ORD-2024-007',
      orderType: 'Takeaway',
      customer: { name: 'Andi Wijaya', phone: '081234567896' },
      items: [{ name: 'Signature Ramen', quantity: 1, price: 65000 }],
      total: 65000,
      status: 'Siap',
      paymentMethod: 'Cash',
      paymentStatus: 'Pending',
      orderTime: '11:45 AM',
      pickupTime: '12:15 PM',
      branch: 'Jakarta Selatan'
    },
    {
      id: '8',
      orderNumber: 'ORD-2024-008',
      orderType: 'Delivery',
      customer: { name: 'Maya Putri', phone: '081234567897', address: 'Jl. Asia Afrika No. 88, Jakarta Selatan' },
      items: [{ name: 'Sushi Platter', quantity: 2, price: 85000 }],
      total: 185000,
      status: 'Diproses',
      paymentMethod: 'Credit Card',
      paymentStatus: 'Paid',
      orderTime: '12:00 PM',
      branch: 'Jakarta Selatan',
      deliveryFee: 15000
    },
    {
      id: '9',
      orderNumber: 'ORD-2024-009',
      orderType: 'Takeaway',
      customer: { name: 'Rudi Hartono', phone: '081234567898' },
      items: [{ name: 'Bento Box', quantity: 1, price: 55000 }],
      total: 55000,
      status: 'Selesai',
      paymentMethod: 'E-Wallet',
      paymentStatus: 'Paid',
      orderTime: '08:30 AM',
      pickupTime: '09:00 AM',
      branch: 'Jakarta Pusat'
    },
    {
      id: '10',
      orderNumber: 'ORD-2024-010',
      orderType: 'Delivery',
      customer: { name: 'Sari Indah', phone: '081234567899', address: 'Jl. Veteran No. 22, Jakarta Pusat' },
      items: [{ name: 'Matcha Ice Cream', quantity: 4, price: 35000 }],
      total: 155000,
      status: 'Dikirim',
      paymentMethod: 'Cash',
      paymentStatus: 'Pending',
      orderTime: '12:15 PM',
      branch: 'Jakarta Pusat',
      deliveryFee: 15000
    },
    {
      id: '11',
      orderNumber: 'ORD-2024-011',
      orderType: 'Delivery',
      customer: { name: 'Bambang Setiawan', phone: '081234567800', address: 'Jl. Proklamasi No. 45, Jakarta Pusat' },
      items: [{ name: 'Signature Ramen', quantity: 2, price: 65000 }],
      total: 145000,
      status: 'Menunggu',
      paymentMethod: 'E-Wallet',
      paymentStatus: 'Paid',
      orderTime: '12:30 PM',
      branch: 'Jakarta Pusat',
      deliveryFee: 15000
    },
    {
      id: '12',
      orderNumber: 'ORD-2024-012',
      orderType: 'Takeaway',
      customer: { name: 'Lina Marlina', phone: '081234567801' },
      items: [{ name: 'Green Tea', quantity: 3, price: 25000 }],
      total: 75000,
      status: 'Siap',
      paymentMethod: 'Cash',
      paymentStatus: 'Pending',
      orderTime: '12:45 PM',
      pickupTime: '01:15 PM',
      branch: 'Jakarta Selatan'
    },
    {
      id: '13',
      orderNumber: 'ORD-2024-013',
      orderType: 'Delivery',
      customer: { name: 'Hendra Gunawan', phone: '081234567802', address: 'Jl. Diponegoro No. 67, Jakarta Selatan' },
      items: [{ name: 'Takoyaki Supreme', quantity: 1, price: 45000 }, { name: 'Sushi Platter', quantity: 1, price: 85000 }],
      total: 145000,
      status: 'Diproses',
      paymentMethod: 'Credit Card',
      paymentStatus: 'Paid',
      orderTime: '01:00 PM',
      branch: 'Jakarta Selatan',
      deliveryFee: 15000
    },
    {
      id: '14',
      orderNumber: 'ORD-2024-014',
      orderType: 'Takeaway',
      customer: { name: 'Fitri Handayani', phone: '081234567803' },
      items: [{ name: 'Bento Box', quantity: 2, price: 55000 }],
      total: 110000,
      status: 'Selesai',
      paymentMethod: 'E-Wallet',
      paymentStatus: 'Paid',
      orderTime: '07:30 AM',
      pickupTime: '08:00 AM',
      branch: 'Jakarta Pusat'
    },
    {
      id: '15',
      orderNumber: 'ORD-2024-015',
      orderType: 'Delivery',
      customer: { name: 'Agus Salim', phone: '081234567804', address: 'Jl. Cikini Raya No. 33, Jakarta Pusat' },
      items: [{ name: 'Signature Ramen', quantity: 3, price: 65000 }],
      total: 210000,
      status: 'Dikirim',
      paymentMethod: 'Cash',
      paymentStatus: 'Pending',
      orderTime: '01:15 PM',
      branch: 'Jakarta Pusat',
      deliveryFee: 15000
    },
    {
      id: '16',
      orderNumber: 'ORD-2024-016',
      orderType: 'Delivery',
      customer: { name: 'Yuni Astuti', phone: '081234567805', address: 'Jl. Teuku Umar No. 99, Jakarta Selatan' },
      items: [{ name: 'Matcha Ice Cream', quantity: 2, price: 35000 }],
      total: 85000,
      status: 'Menunggu',
      paymentMethod: 'E-Wallet',
      paymentStatus: 'Paid',
      orderTime: '01:30 PM',
      branch: 'Jakarta Selatan',
      deliveryFee: 15000
    },
    {
      id: '17',
      orderNumber: 'ORD-2024-017',
      orderType: 'Takeaway',
      customer: { name: 'Doni Prasetyo', phone: '081234567806' },
      items: [{ name: 'Takoyaki Supreme', quantity: 2, price: 45000 }],
      total: 90000,
      status: 'Siap',
      paymentMethod: 'Cash',
      paymentStatus: 'Pending',
      orderTime: '01:45 PM',
      pickupTime: '02:15 PM',
      branch: 'Jakarta Pusat'
    },
    {
      id: '18',
      orderNumber: 'ORD-2024-018',
      orderType: 'Delivery',
      customer: { name: 'Wati Suryani', phone: '081234567807', address: 'Jl. Pattimura No. 11, Jakarta Selatan' },
      items: [{ name: 'Sushi Platter', quantity: 1, price: 85000 }, { name: 'Green Tea', quantity: 2, price: 25000 }],
      total: 150000,
      status: 'Diproses',
      paymentMethod: 'Credit Card',
      paymentStatus: 'Paid',
      orderTime: '02:00 PM',
      branch: 'Jakarta Selatan',
      deliveryFee: 15000
    },
    {
      id: '19',
      orderNumber: 'ORD-2024-019',
      orderType: 'Takeaway',
      customer: { name: 'Irfan Hakim', phone: '081234567808' },
      items: [{ name: 'Bento Box', quantity: 1, price: 55000 }],
      total: 55000,
      status: 'Dibatalkan',
      paymentMethod: 'E-Wallet',
      paymentStatus: 'Failed',
      orderTime: '02:15 PM',
      branch: 'Jakarta Pusat'
    },
    {
      id: '20',
      orderNumber: 'ORD-2024-020',
      orderType: 'Delivery',
      customer: { name: 'Nurul Hidayah', phone: '081234567809', address: 'Jl. Menteng Raya No. 55, Jakarta Pusat' },
      items: [{ name: 'Signature Ramen', quantity: 1, price: 65000 }],
      total: 80000,
      status: 'Selesai',
      paymentMethod: 'Cash',
      paymentStatus: 'Paid',
      orderTime: '06:30 AM',
      branch: 'Jakarta Pusat',
      deliveryFee: 15000
    },
    {
      id: '21',
      orderNumber: 'ORD-2024-021',
      orderType: 'Delivery',
      customer: { name: 'Joko Widodo', phone: '081234567810', address: 'Jl. Kemang No. 77, Jakarta Selatan' },
      items: [{ name: 'Takoyaki Supreme', quantity: 4, price: 45000 }],
      total: 195000,
      status: 'Dikirim',
      paymentMethod: 'E-Wallet',
      paymentStatus: 'Paid',
      orderTime: '02:30 PM',
      branch: 'Jakarta Selatan',
      deliveryFee: 15000
    },
    {
      id: '22',
      orderNumber: 'ORD-2024-022',
      orderType: 'Takeaway',
      customer: { name: 'Sri Mulyani', phone: '081234567811' },
      items: [{ name: 'Matcha Ice Cream', quantity: 3, price: 35000 }],
      total: 105000,
      status: 'Menunggu',
      paymentMethod: 'Cash',
      paymentStatus: 'Pending',
      orderTime: '02:45 PM',
      pickupTime: '03:15 PM',
      branch: 'Jakarta Selatan'
    },
    {
      id: '23',
      orderNumber: 'ORD-2024-023',
      orderType: 'Delivery',
      customer: { name: 'Tono Suratman', phone: '081234567812', address: 'Jl. Salemba No. 44, Jakarta Pusat' },
      items: [{ name: 'Sushi Platter', quantity: 2, price: 85000 }],
      total: 185000,
      status: 'Siap',
      paymentMethod: 'Credit Card',
      paymentStatus: 'Paid',
      orderTime: '03:00 PM',
      branch: 'Jakarta Pusat',
      deliveryFee: 15000
    },
    {
      id: '24',
      orderNumber: 'ORD-2024-024',
      orderType: 'Takeaway',
      customer: { name: 'Ratna Sari', phone: '081234567813' },
      items: [{ name: 'Green Tea', quantity: 1, price: 25000 }],
      total: 25000,
      status: 'Selesai',
      paymentMethod: 'E-Wallet',
      paymentStatus: 'Paid',
      orderTime: '05:30 AM',
      pickupTime: '06:00 AM',
      branch: 'Jakarta Pusat'
    },
    {
      id: '25',
      orderNumber: 'ORD-2024-025',
      orderType: 'Delivery',
      customer: { name: 'Budi Santoso Jr', phone: '081234567814', address: 'Jl. Rasuna Said No. 100, Jakarta Selatan' },
      items: [{ name: 'Bento Box', quantity: 2, price: 55000 }, { name: 'Green Tea', quantity: 2, price: 25000 }],
      total: 175000,
      status: 'Diproses',
      paymentMethod: 'Cash',
      paymentStatus: 'Pending',
      orderTime: '03:15 PM',
      branch: 'Jakarta Selatan',
      deliveryFee: 15000
    }
    ]);
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
    const matchesOrderType = selectedOrderType === 'All' || order.orderType === selectedOrderType;
    return matchesSearch && matchesStatus && matchesOrderType;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedOrderType]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Menunggu':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Diproses':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Siap':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'Dikirim':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Selesai':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Dibatalkan':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Menunggu':
        return <Clock className="h-4 w-4" />;
      case 'Diproses':
        return <ChefHat className="h-4 w-4" />;
      case 'Siap':
        return <Package className="h-4 w-4" />;
      case 'Dikirim':
        return <Truck className="h-4 w-4" />;
      case 'Selesai':
        return <Check className="h-4 w-4" />;
      case 'Dibatalkan':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    // Update selected order if it's the one being changed
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
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
            const isActive = item.href === '/admin/orders';
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
              <p className="text-xs uppercase tracking-[0.3em] text-[#EFB036]">Orders Management</p>
              <h1 className="mt-2 text-2xl font-semibold md:text-3xl">Kelola Pesanan</h1>
              <p className="mt-2 text-sm text-slate-600">
                Monitor dan kelola semua pesanan pelanggan secara real-time.
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
          <div className="mb-8 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nomor order atau nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm shadow-sm transition-all placeholder:text-slate-400 focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="space-y-3">
              {/* Status Filter */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Filter className="h-4 w-4" />
                  <span>Status:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        selectedStatus === status
                          ? 'bg-[#EFB036] text-black shadow-md'
                          : 'border border-slate-200 bg-white text-slate-600 hover:border-[#EFB036]/50 hover:bg-[#EFB036]/5'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Type Filter */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Truck className="h-4 w-4" />
                  <span>Tipe:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Delivery', 'Takeaway'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedOrderType(type)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        selectedOrderType === type
                          ? 'bg-[#EFB036] text-black shadow-md'
                          : 'border border-slate-200 bg-white text-slate-600 hover:border-[#EFB036]/50 hover:bg-[#EFB036]/5'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between text-sm">
              <p className="text-slate-600">
                Menampilkan <span className="font-semibold text-slate-900">{filteredOrders.length}</span> pesanan
                {selectedStatus !== 'All' && (
                  <span className="text-slate-500"> dengan status {selectedStatus}</span>
                )}
              </p>
            </div>
          </div>

          {/* Orders Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Items
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {currentOrders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                order.orderType === 'Delivery'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {order.orderType === 'Delivery' ? <Truck className="h-3 w-3" /> : <Package className="h-3 w-3" />}
                              {order.orderType}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{order.branch}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{order.customer.name}</p>
                          <p className="text-xs text-slate-500">{order.customer.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-lg font-semibold text-slate-900">
                          {order.items.length}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{formatCurrency(order.total)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-slate-900">{order.paymentMethod}</p>
                          <span
                            className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              order.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-700'
                                : order.paymentStatus === 'Pending'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <Clock className="h-4 w-4" />
                          {order.orderTime}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-1 rounded-lg bg-[#EFB036] px-3 py-2 text-xs font-medium text-black transition-all hover:bg-[#dfa028]"
                        >
                          <Eye className="h-4 w-4" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {filteredOrders.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
              <div className="text-sm text-slate-600">
                Menampilkan <span className="font-semibold text-slate-900">{indexOfFirstOrder + 1}</span> - <span className="font-semibold text-slate-900">{Math.min(indexOfLastOrder, filteredOrders.length)}</span> dari <span className="font-semibold text-slate-900">{filteredOrders.length}</span> pesanan
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                          currentPage === page
                            ? 'bg-[#EFB036] text-black shadow-md'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 text-slate-400">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16">
              <ShoppingCart className="h-16 w-16 text-slate-300" />
              <p className="mt-4 text-lg font-semibold text-slate-900">Tidak ada pesanan ditemukan</p>
              <p className="mt-2 text-sm text-slate-500">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          )}
        </main>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">Detail Pesanan</h2>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                      selectedOrder.orderType === 'Delivery'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {selectedOrder.orderType === 'Delivery' ? <Truck className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                    {selectedOrder.orderType}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
              {/* Order Type Info */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  {selectedOrder.orderType === 'Delivery' ? 'Informasi Pengiriman' : 'Informasi Pickup'}
                </h3>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Nama:</span>
                    <span className="text-sm font-semibold text-slate-900">{selectedOrder.customer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Telepon:</span>
                    <span className="text-sm font-semibold text-slate-900">{selectedOrder.customer.phone}</span>
                  </div>
                  {selectedOrder.orderType === 'Delivery' && selectedOrder.customer.address && (
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-slate-600">Alamat Pengiriman:</span>
                      <span className="text-sm font-semibold text-slate-900">{selectedOrder.customer.address}</span>
                    </div>
                  )}
                  {selectedOrder.orderType === 'Takeaway' && selectedOrder.pickupTime && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Waktu Pickup:</span>
                      <span className="text-sm font-semibold text-[#EFB036]">{selectedOrder.pickupTime}</span>
                    </div>
                  )}
                  {selectedOrder.notes && (
                    <div className="flex flex-col gap-1 border-t border-slate-200 pt-2">
                      <span className="text-sm text-slate-600">Catatan:</span>
                      <span className="text-sm font-semibold text-slate-900">{selectedOrder.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Item Pesanan</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-[#EFB036]">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Status */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Pembayaran</h3>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">Metode</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedOrder.paymentMethod}</p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        selectedOrder.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : selectedOrder.paymentStatus === 'Pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Status Pesanan</h3>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <label className="mb-2 block text-xs font-medium text-slate-600">Ubah Status:</label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as Order['status'])}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold transition-all focus:border-[#EFB036] focus:outline-none focus:ring-2 focus:ring-[#EFB036]/20"
                    >
                      {statusOptions.filter(s => s !== 'All').map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <div className="mt-3">
                      <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="rounded-xl border-2 border-[#EFB036] bg-[#EFB036]/5 p-4 space-y-2">
                {selectedOrder.orderType === 'Delivery' && selectedOrder.deliveryFee && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Subtotal Item</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(selectedOrder.total - selectedOrder.deliveryFee)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Biaya Pengiriman</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(selectedOrder.deliveryFee)}</span>
                    </div>
                    <div className="border-t border-[#EFB036]/30 pt-2" />
                  </>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-slate-900">Total Pembayaran</span>
                  <span className="text-2xl font-bold text-[#EFB036]">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 p-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="h-11 w-full rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
