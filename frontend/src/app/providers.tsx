'use client';

import { AuthProvider } from '../hooks/auth/useAuth';

export function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}