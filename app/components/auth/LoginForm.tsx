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
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <div className="space-y-3">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.24em] text-black/50">
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
            className="w-full rounded-3xl border border-black/10 bg-white px-6 py-4 text-sm text-black shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition-all focus:border-brand-gold/80 focus:ring-2 focus:ring-brand-gold/30"
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.24em] text-black/50">
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
            className="w-full rounded-3xl border border-black/10 bg-white px-6 py-4 text-sm text-black shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition-all focus:border-brand-gold/80 focus:ring-2 focus:ring-brand-gold/30"
          />
        </div>

        <label className="flex items-center gap-3 text-xs text-black/50">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-4 w-4 rounded border border-black/20 text-brand-gold focus:ring-brand-gold/50"
          />
          <span className="font-semibold uppercase tracking-[0.22em]">Ingat saya</span>
        </label>

        {error && (
          <p className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-gradient-to-r from-brand-gold via-amber-200 to-brand-gold px-6 py-4 text-base font-semibold uppercase tracking-[0.24em] text-black shadow-[0_24px_56px_rgba(239,176,54,0.35)] transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-80"
        >
          {isSubmitting ? 'Masuk...' : 'Masuk Sekarang'}
        </Button>
      </form>

      <div className="flex items-center gap-4 text-xs uppercase tracking-[0.24em] text-black/40">
        <span className="h-px flex-1 bg-black/10" />
        atau masuk dengan
        <span className="h-px flex-1 bg-black/10" />
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-8 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-black/70 transition-all hover:border-brand-gold/50 hover:text-black"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path
                fill="currentColor"
                d="M21.35 11.1h-9.18v2.98h5.54c-.24 1.4-.98 2.58-2.09 3.37v2.8h3.38c1.97-1.82 3.11-4.5 3.11-7.68 0-.74-.07-1.45-.2-2.12Z"
              />
              <path
                fill="currentColor"
                d="M12.17 22c2.83 0 5.21-.94 6.94-2.56l-3.38-2.8c-.94.63-2.14 1-3.56 1-2.74 0-5.06-1.85-5.89-4.35H2.74v2.87C4.46 19.78 7.97 22 12.17 22Z"
                opacity=".6"
              />
              <path
                fill="currentColor"
                d="M6.28 13.29c-.21-.63-.33-1.31-.33-2.01 0-.7.12-1.38.33-2.01V6.4H2.74A9.93 9.93 0 0 0 1.5 11.28c0 1.57.37 3.05 1.04 4.36l3.74-2.35Z"
                opacity=".6"
              />
              <path
                fill="currentColor"
                d="M12.17 4.58c1.54 0 2.93.53 4.02 1.57l3.01-3.02C17.36 1.2 14.99 0 12.17 0 7.97 0 4.46 2.22 2.74 5.41l3.54 2.87c.83-2.5 3.15-4.35 5.89-4.35Z"
                opacity=".6"
              />
            </svg>
          </span>
          Google
        </button>
      </div>
    </>
  );
}

export default LoginForm;
