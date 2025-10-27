"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  variant: 'login' | 'register';
  badge: string;
  headline: string;
  description: string;
  secondaryAction: {
    text: string;
    href: string;
    label: string;
  };
  image: {
    src: string;
    alt: string;
    title: string;
    subtitle: string;
  };
  children: ReactNode;
}

export function AuthLayout({
  variant,
  badge,
  headline,
  description,
  secondaryAction,
  image,
  children
}: AuthLayoutProps) {
  const imageOnLeft = variant === 'login';

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fdf9f1] px-3 py-6 text-black sm:px-6 sm:py-10 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-[360px] w-[360px] rounded-full bg-brand-gold/20 blur-[140px]" />
        <div className="absolute bottom-[-260px] left-1/2 h-[380px] w-[620px] -translate-x-1/2 rounded-full bg-[#f1d7a4]/35 blur-[160px]" />
        <div className="absolute top-[35%] -right-40 h-[420px] w-[460px] rounded-full bg-[#d6defa]/40 blur-[160px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1180px] overflow-hidden rounded-2xl border border-white/60 bg-white/95 shadow-[0_28px_96px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:rounded-[36px]">
        <div
          className={cn(
            'relative flex flex-col lg:h-full lg:flex-row',
            imageOnLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'
          )}
        >
          <div className="relative flex w-full flex-col px-5 py-6 sm:px-10 sm:py-8 lg:w-[51%] lg:px-14 lg:py-10">
            <div className="flex items-center justify-between gap-3 sm:gap-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Image src="/icons/logo2.png" alt="TakumaEat" width={52} height={52} className="h-10 w-10 rounded-full object-cover shadow-lg sm:h-12 sm:w-12" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-gold sm:text-[11px] sm:tracking-[0.28em]">TakumaEat</p>
                  <p className="text-xs text-black/60 sm:text-sm">Japanese Dining</p>
                </div>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-xs font-medium text-black shadow-sm transition-all duration-200 hover:border-brand-gold/50 hover:bg-black/5 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
              >
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Back To Home</span>
                <span className="sm:hidden">Home</span>
              </Link>
            </div>

            <div className="mt-6 sm:mt-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-black/60 sm:gap-2 sm:px-4 sm:text-[10px] sm:tracking-[0.32em]">
                <span className="inline-block h-2 w-2 rounded-full bg-brand-gold" />
                {badge}
              </span>
              <h1 className="mt-4 text-xl font-semibold tracking-tight text-black sm:mt-6 sm:text-2xl lg:text-3xl">
                {headline}
              </h1>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-black/60 sm:mt-3 sm:text-sm">{description}</p>
            </div>

            <motion.div
              key={variant}
              initial={{ x: imageOnLeft ? 48 : -48, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 flex w-full justify-center sm:mt-8"
            >
              <div className="w-full max-w-md space-y-6">{children}</div>
            </motion.div>

            <p className="mt-6 text-center text-xs text-black/55 sm:mt-8 sm:text-sm">
              {secondaryAction.text}{' '}
              <Link href={secondaryAction.href} className="font-semibold text-brand-gold transition-colors duration-200 hover:text-black">
                {secondaryAction.label}
              </Link>
            </p>
          </div>

          <motion.div
            key={`${variant}-image`}
            initial={{ x: imageOnLeft ? -80 : 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
            className="relative hidden w-full overflow-hidden lg:flex lg:w-[49%]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
            <Image src={image.src} alt={image.alt} fill priority={variant === 'login'} className="object-cover" />
            <div
              className={cn(
                'pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-l from-black/60 via-black/30 to-transparent p-10 text-white',
                imageOnLeft ? 'items-start text-left' : 'items-start text-left'
              )}
            >
              <p className="text-xs uppercase tracking-[0.28em] text-brand-gold">{image.subtitle}</p>
              <h2 className="mt-2 text-2xl font-semibold">{image.title}</h2>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
