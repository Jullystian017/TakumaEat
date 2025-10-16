import type { Metadata } from 'next';
import { AuthLayout } from '@/app/components/auth/AuthLayout';
import { RegisterForm } from '@/app/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Daftar | TakumaEat',
  description:
    'Bergabung dengan TakumaEat untuk menikmati pengalaman kuliner Jepang premium dengan manfaat eksklusif member.'
};

export default function RegisterPage() {
  return (
    <AuthLayout
      variant="register"
      badge="Daftar gratis"
      headline="Buat akun TakumaEat"
      description="Mulai jelajahi menu premium, kumpulkan poin rewards, dan nikmati rekomendasi eksklusif yang sesuai dengan preferensi Anda."
      secondaryAction={{
        text: 'Sudah punya akun?',
        label: 'Masuk di sini',
        href: '/login'
      }}
      image={{
        src: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1200&auto=format&fit=crop',
        alt: 'TakumaEat Registration Visual',
        title: 'Your Taste Journey Awaits',
        subtitle: 'TakumaEat Premium'
      }}
    >
      <RegisterForm />
    </AuthLayout>
  );
}
