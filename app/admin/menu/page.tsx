import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import MenuClient from './MenuClient';

export const metadata: Metadata = {
  title: 'Menu Management | TakumaEat Admin',
  description: 'Kelola menu makanan dan minuman TakumaEat'
};

export default async function AdminMenuPage() {
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
    <MenuClient
      displayName={displayName}
      displayNameInitial={displayNameInitial}
      userEmail={userEmail}
    />
  );
}
