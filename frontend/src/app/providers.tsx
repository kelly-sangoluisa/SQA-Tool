'use client';

import { AuthProvider } from '../hooks/auth/useAuth';
import { SidebarProvider } from '../components/dashboard/sidebar';

export function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </AuthProvider>
  );
}
