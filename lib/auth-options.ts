import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

import { supabaseAdminClient } from '@/lib/supabase/admin';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Email dan kata sandi diperlukan');
        }

        const normalizedEmail = credentials.email.toLowerCase();

        const { data: existingUser, error } = await supabaseAdminClient
          .from('profiles')
          .select('id, name, email, phone, password_hash, role')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (error || !existingUser) {
          throw new Error('Email atau kata sandi salah');
        }

        const passwordValid = await bcrypt.compare(
          credentials.password,
          existingUser.password_hash
        );

        if (!passwordValid) {
          throw new Error('Email atau kata sandi salah');
        }

        return {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          phone: existingUser.phone ?? undefined,
          role: (existingUser.role as 'customer' | 'admin') ?? 'customer'
        };
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name ?? null;
        token.email = user.email;
        token.phone = (user as { phone?: string | null }).phone ?? null;
        token.role = (user as { role?: 'customer' | 'admin' }).role ?? 'customer';
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = (token.name as string | null) ?? undefined;
        session.user.email = token.email as string;
        session.user.phone = (token.phone as string | null) ?? undefined;
        session.user.role = (token.role as 'customer' | 'admin' | undefined) ?? 'customer';
      }

      return session;
    }
  }
};
