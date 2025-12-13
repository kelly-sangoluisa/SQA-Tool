import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
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