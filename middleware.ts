import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';

const adminMatcher = /^\/admin(\/.*)?$/;

export default withAuth(
  function middleware(request: NextRequest) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (!token) {
          return false;
        }

        const pathname = req.nextUrl.pathname;

        if (adminMatcher.test(pathname)) {
          return token.role === 'admin';
        }

        return true;
      }
    },
    pages: {
      signIn: '/login'
    }
  }
);

export const config = {
  matcher: ['/dashboard', '/admin/:path*']
};
