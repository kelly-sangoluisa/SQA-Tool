import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define rutas protegidas (requieren autenticación)
  const isProtectedRoute = path.startsWith('/dashboard') || 
                          path.startsWith('/modules');

  // Define rutas de autenticación
  const isAuthRoute = path.startsWith('/auth');

  // Buscar cookies de sesión de Supabase
  const accessToken = request.cookies.get('sb-access-token')?.value ||
                     request.cookies.get('supabase-auth-token')?.value ||
                     request.cookies.get('sb-127.0.0.1-auth-token')?.value;

  // Si intenta acceder a ruta protegida sin token, redirigir a login
  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL('/auth/login', request.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  // Si ya está autenticado y trata de acceder a rutas de auth (excepto logout), redirigir a dashboard
  if (isAuthRoute && accessToken && !path.includes('signout')) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - api (rutas de API)
     * - _next/static (archivos estáticos)
     * - _next/image (archivos de optimización de imágenes)
     * - favicon.ico
     * - archivos públicos
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};