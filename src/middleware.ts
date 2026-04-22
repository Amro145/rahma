import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtRole(token: string): string | null {
  try {
    const payloadPart = token.split('.')[1];
    const decodedPayload = Buffer.from(payloadPart, 'base64').toString('utf-8');
    const parsed = JSON.parse(decodedPayload);
    return parsed.role || null;
  } catch (err) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const jwt = request.cookies.get('jwt')?.value;
  const { pathname } = request.nextUrl;

  const isAdminRoute = 
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/students') ||
    pathname.startsWith('/finance');

  const isStudentRoute = pathname.startsWith('/profile');
  const isAuthRoute = pathname === '/signin' || pathname === '/signup';

  if (!jwt) {
    if (isAdminRoute || isStudentRoute) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    return NextResponse.next();
  }

  const role = decodeJwtRole(jwt);

  if (isAuthRoute) {
    if (role === 'student') {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (role === 'student' && isAdminRoute) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  if (role === 'admin' && isStudentRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/students/:path*',
    '/finance/:path*',
    '/profile/:path*',
    '/signin',
    '/signup',
  ],
};