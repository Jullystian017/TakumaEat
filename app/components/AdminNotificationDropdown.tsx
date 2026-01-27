'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, ShoppingBag, Info, Check, Calendar, ArrowRight, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Notification {
    id: string;
    title: string;
    description: string;
    category: string;
    status: 'read' | 'unread';
    action_url?: string;
    created_at: string;
}

export default function AdminNotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter((n) => n.status === 'unread').length;

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/notifications');
            const data = await res.json();
            if (data.notifications) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds for new orders
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const markAsRead = async (id?: string) => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: 'read' }),
            });

            if (id) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' as const } : n));
            } else {
                setNotifications(prev => prev.map(n => ({ ...n, status: 'read' as const })));
            }
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    function timeAgo(dateString: string) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Baru saja';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m yang lalu`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}j yang lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    }

    const getIcon = (category: string) => {
        switch (category) {
            case 'order': return <ShoppingBag className="h-4 w-4 text-[#EFB036]" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300",
                    isOpen
                        ? "border-[#EFB036] bg-[#EFB036]/5 text-[#EFB036] shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-[#EFB036] hover:text-[#EFB036] shadow-sm"
                )}
            >
                <Bell className={cn("h-5 w-5", unreadCount > 0 && "animate-[bell-ring_1s_infinite]")} />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl z-[100]"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Notifikasi</h3>
                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{unreadCount} Belum dibaca</p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAsRead()}
                                    className="text-[10px] font-bold text-[#EFB036] hover:underline uppercase tracking-wider"
                                >
                                    Tandai semua dibaca
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-3">
                                    <div className="h-5 w-5 border-2 border-[#EFB036] border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs text-slate-400 font-medium">Memuat...</span>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                                        <BellOff className="h-6 w-6 text-slate-300" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-900">Belum ada notifikasi</p>
                                    <p className="text-xs text-slate-500 mt-1">Kami akan mengabarimu saat ada aktivitas baru.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={cn(
                                                "group relative flex gap-4 px-5 py-4 transition-colors hover:bg-slate-50",
                                                notification.status === 'unread' && "bg-[#EFB036]/[0.02]"
                                            )}
                                        >
                                            <div className={cn(
                                                "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border transition-all",
                                                notification.status === 'unread'
                                                    ? "border-[#EFB036]/20 bg-[#EFB036]/5 shadow-sm"
                                                    : "border-slate-100 bg-white"
                                            )}>
                                                {getIcon(notification.category)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={cn(
                                                        "text-xs leading-snug",
                                                        notification.status === 'unread' ? "font-bold text-slate-900" : "font-medium text-slate-600"
                                                    )}>
                                                        {notification.title}
                                                    </p>
                                                    <span className="text-[10px] whitespace-nowrap text-slate-400 font-medium">{timeAgo(notification.created_at)}</span>
                                                </div>
                                                <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                                    {notification.description}
                                                </p>

                                                {notification.action_url && (
                                                    <Link
                                                        href={notification.action_url}
                                                        onClick={() => {
                                                            markAsRead(notification.id);
                                                            setIsOpen(false);
                                                        }}
                                                        className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-[#EFB036] hover:gap-2 transition-all uppercase tracking-wider"
                                                    >
                                                        Lihat Detail <ArrowRight className="h-3 w-3" />
                                                    </Link>
                                                )}
                                            </div>
                                            {notification.status === 'unread' && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="h-6 w-6 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-[#EFB036] shadow-sm"
                                                        title="Tandai dibaca"
                                                    >
                                                        <Check className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="border-t border-slate-100 p-3 bg-slate-50/30">
                                <Link
                                    href="/admin/notifications"
                                    onClick={() => setIsOpen(false)}
                                    className="flex w-full items-center justify-center rounded-xl bg-white border border-slate-200 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                    Lihat Semua Notifikasi
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
        @keyframes bell-ring {
          0%, 100% { transform: rotate(0); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-15deg); }
          60% { transform: rotate(10deg); }
          80% { transform: rotate(-10deg); }
        }
      `}</style>
        </div>
    );
}
