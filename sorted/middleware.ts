import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { CA_HOME, canAccessPath } from '@/lib/auth/permissions';

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const pathname = req.nextUrl.pathname;

    if (!canAccessPath(role, pathname)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const url = req.nextUrl.clone();
      url.pathname = CA_HOME;
      url.search = '';
      return NextResponse.redirect(url);
    }

    // CA landing on home → bills
    if (role === 'ca' && pathname === '/') {
      const url = req.nextUrl.clone();
      url.pathname = CA_HOME;
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
  }
);

export const config = {
  matcher: [
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
