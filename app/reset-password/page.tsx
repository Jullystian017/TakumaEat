import type { Metadata } from 'next';
import { AuthLayout } from '@/app/components/auth/AuthLayout';
import { ResetPasswordFormWrapper } from '@/app/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
    title: 'Atur Ulang Kata Sandi | TakumaEat',
    description: 'Tetapkan kata sandi baru untuk akun TakumaEat Anda.'
};

export default function ResetPasswordPage() {
    return (
        <AuthLayout
            variant="login"
            badge="Keamanan Akun"
            headline="Atur Ulang Kata Sandi"
            description="Silakan tentukan kata sandi baru yang kuat untuk menjaga keamanan akun Anda."
            secondaryAction={{
                text: 'Batal atur ulang?',
                label: 'Kembali ke login',
                href: '/login'
            }}
            image={{
                src: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=765',
                alt: 'TakumaEat Security Hub',
                title: 'Strong Protection',
                subtitle: 'TakumaEat Security'
            }}
        >
            <ResetPasswordFormWrapper />
        </AuthLayout>
    );
}
