import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Obtener el token de autenticación de las cookies (Supabase usa sb-access-token)
  const token = request.cookies.get('sb-access-token')?.value;
  
  // Rutas protegidas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/configuration-evaluation', '/data-entry', '/parameterization', '/results'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Si el usuario está autenticado y trata de acceder a rutas públicas de auth (excepto la raíz)
  if (token && pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Si el usuario no está autenticado y trata de acceder a rutas protegidas
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Proteger todas las rutas excepto archivos estáticos y API
    '/((?!api|_next/static|_next/image|favicon.ico|logo-SQATool.png).*)',
  ],
};