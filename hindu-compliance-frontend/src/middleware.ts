/**
 * Next.js Middleware for authentication and route protection
 * Runs on Edge Runtime for optimal performance
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard'];

// Routes that should redirect authenticated users
const AUTH_ROUTES = ['/auth/sign-in'];

// Public routes (no authentication required)
const PUBLIC_ROUTES = ['/', '/about', '/contact'];

/**
 * Check if session cookie exists
 * Note: Middleware cannot decrypt cookies, so we only check existence
 */
function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.has('nandi_session');
}

/**
 * Main middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = hasSessionCookie(request);

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route is auth-related
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Redirect to sign-in if accessing protected route without session
  if (isProtectedRoute && !hasSession) {
    const signInUrl = new URL('/auth/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to dashboard if accessing auth routes with active session
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Continue to the requested page
  return NextResponse.next();
}

/**
 * Middleware configuration
 * Specify which routes should run the middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
