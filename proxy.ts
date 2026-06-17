import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/match', '/chat', '/profile', '/settings', '/entertainment'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';

    if (!isLoggedIn && pathname !== '/auth' && pathname !== '/') {
      const authUrl = new URL('/auth', request.url);
      authUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(authUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/match/:path*', '/chat/:path*', '/profile/:path*', '/settings/:path*', '/entertainment/:path*'],
};
