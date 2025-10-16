import type { Metadata } from 'next';
import { AuthLayout } from '@/app/components/auth/AuthLayout';
import { LoginForm } from '@/app/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Masuk | TakumaEat',
  description:
    'Masuk ke TakumaEat untuk menikmati pengalaman pemesanan kuliner Jepang premium yang dipersonalisasi.'
};

export default function LoginPage() {
  return (
    <AuthLayout
      variant="login"
      badge="Selamat datang kembali"
      headline="Masuk ke TakumaEat"
      description="Kelola pemesanan, pantau reservasi, dan dapatkan rekomendasi menu kurasi chef khusus untuk Anda."
      secondaryAction={{
        text: 'Belum punya akun?',
        label: 'Daftar sekarang',
        href: '/register'
      }}
      image={{
        src: 'https://images.unsplash.com/photo-1683259692515-220679cb1c6a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=765',
        alt: 'TakumaEat Dining Experience',
        title: 'TakumaEat Circle',
        subtitle: 'Premium Member'
      }}
    >
      <LoginForm />
    </AuthLayout>
  );
}
