'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!agreeTerms) {
      setError('Mohon setujui syarat & ketentuan terlebih dahulu.');
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password
        })
      });

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(body.message ?? 'Registrasi gagal, silakan coba lagi.');
        return;
      }

      setSuccess('Registrasi berhasil! Mengarahkan ke beranda...');

      const signInResult = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false
      });

      if (signInResult?.error) {
        setSuccess('Registrasi berhasil. Silakan login secara manual.');
        router.push('/login');
        return;
      }

      router.push('/');
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
          <label htmlFor="name" className="text-xs font-semibold uppercase tracking-[0.24em] text-black/50">
            Nama lengkap
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nama Lengkap"
            required
            className="w-full rounded-3xl border border-black/10 bg-white px-6 py-4 text-sm text-black shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition-all focus:border-brand-gold/80 focus:ring-2 focus:ring-brand-gold/30"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
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
            <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-[0.24em] text-black/50">
              Nomor telepon
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="08XXXXXXXXXX"
              className="w-full rounded-3xl border border-black/10 bg-white px-6 py-4 text-sm text-black shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition-all focus:border-brand-gold/80 focus:ring-2 focus:ring-brand-gold/30"
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
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
              placeholder="Minimal 8 karakter"
              required
              minLength={8}
              className="w-full rounded-3xl border border-black/10 bg-white px-6 py-4 text-sm text-black shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition-all focus:border-brand-gold/80 focus:ring-2 focus:ring-brand-gold/30"
            />
          </div>
          <div className="space-y-3">
            <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-[0.24em] text-black/50">
              Konfirmasi sandi
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Ulangi kata sandi"
              required
              minLength={8}
              className="w-full rounded-3xl border border-black/10 bg-white px-6 py-4 text-sm text-black shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition-all focus:border-brand-gold/80 focus:ring-2 focus:ring-brand-gold/30"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 text-xs text-black/50 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(event) => setAgreeTerms(event.target.checked)}
              className="h-4 w-4 rounded border border-black/20 text-brand-gold focus:ring-brand-gold/50"
            />
            <span className="font-semibold uppercase tracking-[0.22em]">Saya setuju dengan syarat & ketentuan</span>
          </label>
          <p className="text-[11px] uppercase tracking-[0.24em] text-black/40">
            Data Anda aman bersama kami
          </p>
        </div>

        {error && (
          <p className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-gradient-to-r from-brand-gold via-amber-200 to-brand-gold px-6 py-4 text-base font-semibold uppercase tracking-[0.24em] text-black shadow-[0_24px_56px_rgba(239,176,54,0.35)] transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-80"
        >
          {isSubmitting ? 'Mendaftarkan...' : 'Daftar Sekarang'}
        </Button>
      </form>

      <div className="flex items-center gap-4 text-xs uppercase tracking-[0.24em] text-black/40">
        <span className="h-px flex-1 bg-black/10" />
        atau daftar dengan
        <span className="h-px flex-1 bg-black/10" />
      </div>

      <div className="flex flex-wrap justify-center items-center gap-3">
        <button
          type="button"
          className="inline-flex flex-1 items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-black/70 transition-all duration-200 hover:border-brand-gold/50 hover:text-black sm:flex-none sm:px-6"
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
        <button
          type="button"
          className="inline-flex flex-1 items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-black/70 transition-all duration-200 hover:border-brand-gold/50 hover:text-black sm:flex-none sm:px-6"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path
                fill="currentColor"
                d="M22.68 0H1.32A1.32 1.32 0 0 0 0 1.32v21.36A1.32 1.32 0 0 0 1.32 24h11.5v-9.28H9.69v-3.62h3.13V8.41c0-3.1 1.89-4.8 4.66-4.8 1.33 0 2.71.24 2.71.24v2.98h-1.53c-1.5 0-1.97.93-1.97 1.89v2.26h3.35l-.53 3.62h-2.82V24h5.53A1.32 1.32 0 0 0 24 22.68V1.32A1.32 1.32 0 0 0 22.68 0Z"
              />
            </svg>
          </span>
          Facebook
        </button>
      </div>
    </>
  );
}

export default RegisterForm;
