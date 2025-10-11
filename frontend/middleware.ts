import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /dashboard, /auth/signin)
  const path = request.nextUrl.pathname;

  // Define protected routes
  const isProtectedRoute = path.startsWith('/dashboard') || 
                          path.startsWith('/modules') ||
                          path.startsWith('/shared');

  // Define auth routes
  const isAuthRoute = path.startsWith('/auth');

  // Check if user is authenticated by looking for session cookie
  const sessionCookie = request.cookies.get('sb-access-token') || 
                       request.cookies.get('supabase-auth-token') ||
                       request.cookies.get('session');

  // If trying to access protected route without session, redirect to signin
  if (isProtectedRoute && !sessionCookie) {
    const signInUrl = new URL('/auth/login', request.nextUrl.origin);
    signInUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(signInUrl);
  }

  // If already authenticated and trying to access auth routes, redirect to dashboard
  if (isAuthRoute && sessionCookie && path !== '/auth/signout') {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};