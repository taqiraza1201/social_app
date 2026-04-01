import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyUserToken, verifyAdminToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('user_token')?.value;
    if (!token || !verifyUserToken(token)) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // Protect admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('admin_token')?.value;
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
