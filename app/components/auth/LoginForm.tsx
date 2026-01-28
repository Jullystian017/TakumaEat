'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSession, signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
        setError(result.error === 'CredentialsSignin' ? 'Email atau kata sandi salah.' : result.error);
        return;
      }

      const updatedSession = await getSession();
      const role = updatedSession?.user?.role === 'admin' ? 'admin' : 'customer';
      router.push(role === 'admin' ? '/admin/dashboard' : '/');
      router.refresh();
    } catch (err) {
      setError('Terjadi kesalahan tidak terduga. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      setError('Gagal masuk dengan Google.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
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
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/50 sm:text-xs sm:tracking-[0.24em]">
              Kata sandi
            </label>
            <Link
              href="/forgot-password"
              className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-gold hover:text-amber-600 transition-colors sm:text-xs"
            >
              Lupa Kata Sandi?
            </Link>
          </div>
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
          disabled={isSubmitting || isGoogleLoading}
          className="w-full rounded-full bg-gradient-to-r from-brand-gold via-amber-200 to-brand-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black shadow-[0_24px_56px_rgba(239,176,54,0.35)] transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-80 sm:py-4 sm:text-base sm:tracking-[0.24em]"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Memproses...</span>
            </div>
          ) : 'Masuk Sekarang'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-black/5" />
        </div>
        <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.3em] text-black/30">
          <span className="bg-white px-4">Atau masuk dengan</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={isSubmitting || isGoogleLoading}
        onClick={handleGoogleLogin}
        className="w-full rounded-full border-black/10 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black shadow-sm transition-all hover:bg-slate-50 hover:shadow-md disabled:opacity-50 sm:py-4 sm:text-base"
      >
        {isGoogleLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <div className="flex items-center justify-center gap-3">
            <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Google</span>
          </div>
        )}
      </Button>
    </div>
  );
}

export default LoginForm;
