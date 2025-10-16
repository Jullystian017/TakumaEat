'use client';

import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

import { CartProvider } from './context/CartContext';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
}
