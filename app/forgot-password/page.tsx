import type { Metadata } from 'next';
import { AuthLayout } from '@/app/components/auth/AuthLayout';
import { ForgotPasswordForm } from '@/app/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
    title: 'Lupa Kata Sandi | TakumaEat',
    description: 'Atur ulang kata sandi TakumaEat Anda dengan aman.'
};

export default function ForgotPasswordPage() {
    return (
        <AuthLayout
            variant="login" // Reusing login layout styles
            badge="Keamanan Akun"
            headline="Lupa Kata Sandi?"
            description="Jangan khawatir, masukkan email Anda di bawah ini dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda."
            secondaryAction={{
                text: 'Ingat kata sandi?',
                label: 'Kembali masuk',
                href: '/login'
            }}
            image={{
                src: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=765',
                alt: 'TakumaEat Security',
                title: 'Safe & Secure',
                subtitle: 'TakumaEat Guard'
            }}
        >
            <ForgotPasswordForm />
        </AuthLayout>
    );
}
