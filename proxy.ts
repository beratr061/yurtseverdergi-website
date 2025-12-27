import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

// Security Headers
function addSecurityHeaders(response: NextResponse): NextResponse {
  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Content Type Options - MIME type sniffing engelleme
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Frame Options - Clickjacking koruması
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://www.google.com",
      "frame-src 'self' https://www.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join('; ')
  );
  
  // Strict Transport Security (HTTPS zorunluluğu - production'da)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  return response;
}

export default auth(async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files ve API için sadece security headers
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api')
  ) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Admin sayfaları için auth kontrolü (auth callback'te yapılıyor)
  // Burada sadece security headers ekliyoruz
  if (pathname.startsWith('/admin')) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Zaten maintenance sayfasındaysa devam et
  if (pathname === '/maintenance') {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Public sayfalar için bakım modu kontrolü
  // @ts-expect-error - auth middleware adds auth property
  const session = request.auth;

  // Admin kullanıcıları bakım modundan muaf
  if (session?.user?.role === 'ADMIN') {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
