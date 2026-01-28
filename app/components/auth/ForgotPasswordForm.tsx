'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Gagal mengirim permintaan.');
                return;
            }

            setIsSuccess(true);
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
                    <h3 className="text-lg font-semibold text-black">Cek Email Anda</h3>
                    <p className="text-sm text-black/60 leading-relaxed">
                        Jika email <strong>{email}</strong> terdaftar, kami telah mengirimkan instruksi untuk mengatur ulang kata sandi Anda.
                    </p>
                </div>
                <Link
                    href="/login"
                    className="inline-block px-8 py-3 rounded-full bg-slate-900 text-white text-sm font-semibold uppercase tracking-widest hover:bg-black transition-all"
                >
                    Kembali ke Login
                </Link>
            </div>
        );
    }

    return (
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-3">
                <label htmlFor="email" className="text-[10px] font-semibold uppercase tracking-[0.24em] text-black/50 sm:text-xs">
                    Email Terdaftar
                </label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@domain.com"
                    required
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition-all focus:border-brand-gold/80 focus:ring-2 focus:ring-brand-gold/30 sm:rounded-3xl sm:px-6 sm:py-4"
                />
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
                        <span>Mengirim...</span>
                    </div>
                ) : 'Kirim Link Reset'}
            </Button>
        </form>
    );
}
