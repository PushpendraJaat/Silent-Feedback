import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { LRUCache } from 'lru-cache';
import { validateCsrfToken } from '@/lib/validateCsrf';

// ✅ Rate limiting using LRU Cache
const tokenCache = new LRUCache<string, number>({
  max: 500, // Max 500 unique IPs
  ttl: 60 * 1000, // 1 minute TTL
});

// ✅ Get client IP from request headers
const getClientIp = (request: NextRequest): string => {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || // First value in comma-separated list
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1' || // Default to localhost
    '127.0.0.1' // Default to localhost
  );
};

// ✅ Rate limiting function
const rateLimit = (request: NextRequest) => {
  const ip = getClientIp(request);
  if (!ip) {
    console.warn('Unable to detect IP address');
    return;
  }

  const tokenCount = tokenCache.get(ip) || 0;

  if (tokenCount >= 500) {
    throw new Error(`Rate limit exceeded for IP: ${ip}`);
  }

  tokenCache.set(ip, tokenCount + 1);
};

// ✅ Define routes
const publicRoutes = ['/signin', '/signup', '/verify-email', '/home'];
const protectedRoutes = ['/dashboard'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request });

  try {
    // ✅ Rate limiting
    rateLimit(request);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Rate limit exceeded: ${error.message}`);
    } else {
      console.error('Rate limit exceeded: Unknown error');
    }
    return new NextResponse('Too many requests', { status: 429 });
  }

  // ✅ CSRF protection (Exclude GET and HEAD methods)
  if (!['GET', 'HEAD'].includes(request.method)) {
    try {
      validateCsrfToken(request);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Invalid CSRF token: ${error.message}`);
      } else {
        console.error('Invalid CSRF token: Unknown error');
      }
      return new NextResponse('Invalid CSRF token', { status: 403 });
    }
  }

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // ✅ Redirect authenticated user trying to access public routes
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ✅ Redirect unauthenticated user trying to access protected routes
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // ✅ Allow request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/signin',
    '/signup',
    '/verify-email/:path*',
    '/dashboard/:path*',
    '/home',
    '/api/:path*',
  ],
};
