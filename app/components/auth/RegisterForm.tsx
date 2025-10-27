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
      <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2 sm:space-y-3">
          <label htmlFor="name" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/50 sm:text-xs sm:tracking-[0.24em]">
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
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition-all focus:border-brand-gold/80 focus:ring-2 focus:ring-brand-gold/30 sm:rounded-3xl sm:px-6 sm:py-4"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
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
            <label htmlFor="phone" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/50 sm:text-xs sm:tracking-[0.24em]">
              Nomor telepon
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="08XXXXXXXXXX"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition-all focus:border-brand-gold/80 focus:ring-2 focus:ring-brand-gold/30 sm:rounded-3xl sm:px-6 sm:py-4"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
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
              placeholder="Minimal 8 karakter"
              required
              minLength={8}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition-all focus:border-brand-gold/80 focus:ring-2 focus:ring-brand-gold/30 sm:rounded-3xl sm:px-6 sm:py-4"
            />
          </div>
          <div className="space-y-2 sm:space-y-3">
            <label htmlFor="confirmPassword" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/50 sm:text-xs sm:tracking-[0.24em]">
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
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition-all focus:border-brand-gold/80 focus:ring-2 focus:ring-brand-gold/30 sm:rounded-3xl sm:px-6 sm:py-4"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 text-xs text-black/50 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <label className="flex items-center gap-2 sm:gap-3">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(event) => setAgreeTerms(event.target.checked)}
              className="h-4 w-4 rounded border border-black/20 text-brand-gold focus:ring-brand-gold/50"
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.22em]">Saya setuju dengan syarat & ketentuan</span>
          </label>
        </div>

        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 sm:rounded-3xl sm:px-4 sm:py-3 sm:text-sm" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 sm:rounded-3xl sm:px-4 sm:py-3 sm:text-sm">
            {success}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-gradient-to-r from-brand-gold via-amber-200 to-brand-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black shadow-[0_24px_56px_rgba(239,176,54,0.35)] transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-80 sm:py-4 sm:text-base sm:tracking-[0.24em]"
        >
          {isSubmitting ? 'Mendaftarkan...' : 'Daftar Sekarang'}
        </Button>
      </form>

     

      
    </>
  );
}

export default RegisterForm;
