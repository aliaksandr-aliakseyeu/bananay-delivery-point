import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/ru' || pathname.startsWith('/ru/')) {
    const targetPath = pathname === '/ru' ? '/en' : `/en${pathname.slice(3)}`;
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
