import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'] & {
      id: string;
      phone?: string | null;
      role: 'user' | 'admin';
    };
  }

  interface User {
    id: string;
    phone?: string | null;
    role: 'user' | 'admin';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    phone?: string | null;
    role?: 'user' | 'admin';
  }
}
