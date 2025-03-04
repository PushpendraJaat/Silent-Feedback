import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export { default } from 'next-auth/middleware';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const { pathname } = request.nextUrl;

    const publicRoutes = ['/signin', '/signup', '/verify-email', '/home'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    const isDashboard = pathname.startsWith('/dashboard');

    // If user is authenticated and trying to access a public page, redirect to dashboard
    if (token && isPublicRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If user is NOT authenticated and trying to access protected pages, redirect to signin
    if (!token && isDashboard) {
        return NextResponse.redirect(new URL('/signin', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/signin',
        '/signup',
        '/',
        '/verify-email/:path*',
        '/dashboard/:path*',
        '/home', 
    ],
};
