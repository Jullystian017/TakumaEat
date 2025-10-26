import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import CategoriesClient from './CategoriesClient';

export const metadata: Metadata = {
  title: 'Category Management | TakumaEat Admin',
  description: 'Kelola kategori menu TakumaEat'
};

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user?.role !== 'admin') {
    redirect('/');
  }

  const displayName = session.user?.name?.split(' ')[0] ?? 'Administrator';
  const displayNameInitial = displayName.charAt(0).toUpperCase();
  const userEmail = session.user?.email ?? '';

  return (
    <CategoriesClient
      displayName={displayName}
      displayNameInitial={displayNameInitial}
      userEmail={userEmail}
    />
  );
}
