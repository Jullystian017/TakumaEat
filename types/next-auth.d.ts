import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'] & {
      id: string;
      phone?: string | null;
      role: 'customer' | 'admin';
    };
  }

  interface User {
    id: string;
    phone?: string | null;
    role: 'customer' | 'admin';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    phone?: string | null;
    role?: 'customer' | 'admin';
  }
}
