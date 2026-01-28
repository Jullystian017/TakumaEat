'use client';

import { useState, type FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams?.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (!token) {
            setError('Token tidak ditemukan. Silakan gunakan link dari email Anda.');
            return;
        }

        if (password.length < 8) {
            setError('Kata sandi minimal 8 karakter.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Konfirmasi kata sandi tidak cocok.');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Gagal mengatur ulang kata sandi.');
                return;
            }

            setIsSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            setError('Terjadi kesalahan tidak terduga. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center space-y-6">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-sm border border-emerald-100">
                    <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-black">Kata Sandi Diperbarui</h3>
                    <p className="text-sm text-black/60 leading-relaxed">
                        Kata sandi Anda telah berhasil diubah. Mengalihkan Anda ke halaman login...
                    </p>
                </div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="text-center p-6 border border-red-100 bg-red-50 rounded-3xl">
                <p className="text-sm text-red-600 font-medium">Link reset tidak valid atau sudah kedaluwarsa.</p>
                <Link href="/forgot-password" size="sm" className="mt-4 inline-block text-xs font-bold uppercase text-brand-gold underline underline-offset-4">
                    Minta link baru
                </Link>
            </div>
        );
    }

    return (
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="password" className="text-[10px] font-semibold uppercase tracking-[0.24em] text-black/50 sm:text-xs">
                        Kata Sandi Baru
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimal 8 karakter"
                            required
                            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black shadow-sm transition-all focus:border-brand-gold/80 focus:ring-2 focus:ring-brand-gold/30 sm:rounded-3xl sm:px-6 sm:py-4"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-[10px] font-semibold uppercase tracking-[0.24em] text-black/50 sm:text-xs">
                        Konfirmasi Kata Sandi
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ketik ulang kata sandi"
                        required
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black shadow-sm transition-all focus:border-brand-gold/80 focus:ring-2 focus:ring-brand-gold/30 sm:rounded-3xl sm:px-6 sm:py-4"
                    />
                </div>
            </div>

            {error && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600" role="alert">
                    {error}
                </p>
            )}

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-gradient-to-r from-brand-gold via-amber-200 to-brand-gold px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black shadow-[0_24px_56px_rgba(239,176,54,0.35)] transition-transform hover:-translate-y-0.5 disabled:opacity-80"
            >
                {isSubmitting ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Memperbarui...</span>
                    </div>
                ) : 'Simpan Kata Sandi Baru'}
            </Button>
        </form>
    );
}

export function ResetPasswordFormWrapper() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-brand-gold" /></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
