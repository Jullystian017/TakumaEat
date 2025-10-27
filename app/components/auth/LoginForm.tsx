'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    setIsSubmitting(true);

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false
      });

      if (result?.error) {
        setError('Email atau kata sandi salah.');
        return;
      }

      const updatedSession = await getSession();
      const role = updatedSession?.user?.role === 'admin' ? 'admin' : 'user';
      router.push(role === 'admin' ? '/admin/dashboard' : '/');
      router.refresh();
    } catch (err) {
      setError('Terjadi kesalahan tidak terduga. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2 sm:space-y-3">
          <label htmlFor="email" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/50 sm:text-xs sm:tracking-[0.24em]">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@domain.com"
            required
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition-all focus:border-brand-gold/80 focus:ring-2 focus:ring-brand-gold/30 sm:rounded-3xl sm:px-6 sm:py-4"
          />
        </div>

        <div className="space-y-2 sm:space-y-3">
          <label htmlFor="password" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/50 sm:text-xs sm:tracking-[0.24em]">
            Kata sandi
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Masukkan kata sandi"
            required
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition-all focus:border-brand-gold/80 focus:ring-2 focus:ring-brand-gold/30 sm:rounded-3xl sm:px-6 sm:py-4"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-black/50 sm:gap-3">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-4 w-4 rounded border border-black/20 text-brand-gold focus:ring-brand-gold/50"
          />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.22em]">Ingat saya</span>
        </label>

        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 sm:rounded-3xl sm:px-4 sm:py-3 sm:text-sm" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-gradient-to-r from-brand-gold via-amber-200 to-brand-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black shadow-[0_24px_56px_rgba(239,176,54,0.35)] transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-80 sm:py-4 sm:text-base sm:tracking-[0.24em]"
        >
          {isSubmitting ? 'Masuk...' : 'Masuk Sekarang'}
        </Button>
      </form>

    </>
  );
}

export default LoginForm;
