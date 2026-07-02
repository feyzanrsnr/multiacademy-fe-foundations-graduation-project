import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Korunacak sayfaların listesi
const protectedRoutes = ['/cart', '/checkout', '/orders', '/profile'];

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // Kullanıcı giriş yapmamışsa ve korumalı bir sayfaya gitmeye çalışıyorsa login'e at
  if (!session && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Kullanıcı zaten giriş yapmışsa ve login/register sayfalarına gitmeye çalışıyorsa ana sayfaya at
  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Sadece sayfalar üzerinde çalışması için matcher tanımlıyoruz (statik dosyaları es geçsin)
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};