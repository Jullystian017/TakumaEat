'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, X, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef } from 'react';

// --- TOAST SYSTEM ---

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

export function StatusToast({ message, type, onClose }: ToastProps) {
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        const timer = setTimeout(() => {
            onCloseRef.current();
        }, 4000);
        return () => clearTimeout(timer);
    }, []);


    const icons = {
        success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        error: <XCircle className="h-5 w-5 text-red-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    };

    const colors = {
        success: "border-emerald-100 bg-emerald-50 text-emerald-900",
        error: "border-red-100 bg-red-50 text-red-900",
        info: "border-blue-100 bg-blue-50 text-blue-900",
        warning: "border-amber-100 bg-amber-50 text-amber-900",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
                "fixed bottom-6 right-6 z-[1001] flex min-w-[320px] items-center gap-4 rounded-2xl border p-4 shadow-2xl backdrop-blur-md",
                colors[type]
            )}
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                {icons[type]}
            </div>
            <p className="flex-1 text-sm font-bold leading-tight">{message}</p>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-black/5 transition-colors">
                <X className="h-4 w-4 opacity-50" />
            </button>
        </motion.div>
    );
}

// --- CONFIRMATION MODAL ---

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Ya, Lanjutkan',
    cancelLabel = 'Batalkan',
    type = 'warning',
    isLoading = false
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const themes = {
        danger: {
            icon: <XCircle className="h-8 w-8 text-red-500" />,
            btn: "bg-red-600 hover:bg-red-700 text-white shadow-red-200",
            iconBg: "bg-red-50"
        },
        warning: {
            icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
            btn: "bg-[#EFB036] hover:bg-[#d89a28] text-black shadow-amber-200",
            iconBg: "bg-amber-50"
        },
        info: {
            icon: <Info className="h-8 w-8 text-blue-500" />,
            btn: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200",
            iconBg: "bg-blue-50"
        }
    };

    const theme = themes[type];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/20 bg-white p-8 shadow-2xl"
                >
                    <div className="flex flex-col items-center text-center">
                        <div className={cn("mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner", theme.iconBg)}>
                            {theme.icon}
                        </div>
                        <h3 className="mb-2 text-xl font-black text-slate-900">{title}</h3>
                        <p className="mb-8 text-sm font-medium leading-relaxed text-slate-500">{message}</p>

                        <div className="flex w-full gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="flex-1 rounded-2xl border border-slate-200 bg-white py-4 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                type="button"
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={cn(
                                    "flex-1 rounded-2xl py-4 text-sm font-black transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 disabled:opacity-50",
                                    theme.btn
                                )}
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                {confirmLabel}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
