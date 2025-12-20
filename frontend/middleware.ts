import { NextResponse } from 'next/server';

export function middleware() {
  // TEMPORALMENTE DESACTIVADO - Solo permitir todo para evitar bucles
  // TODO: Re-implementar verificación de auth sin bucles
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Minimizar matcher para evitar conflictos
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};