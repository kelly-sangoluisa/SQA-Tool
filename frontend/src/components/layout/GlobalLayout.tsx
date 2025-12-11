"use client";
import { useAuth } from '@/hooks/auth/useAuth';
import { DashboardSidebar, useSidebar } from '@/components/dashboard/sidebar';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import styles from './GlobalLayout.module.css';

export function GlobalLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { isOpen } = useSidebar();
  const pathname = usePathname();

  // Páginas donde NO se debe mostrar el sidebar
  const excludePaths = ['/auth/login', '/auth/register', '/parameterization'];
  const shouldShowSidebar = !isLoading && 
                           user?.role?.name !== 'admin' && 
                           !excludePaths.some(path => pathname?.startsWith(path));

  return (
    <>
      {shouldShowSidebar && <DashboardSidebar />}
      <div className={`${styles.mainContent} ${shouldShowSidebar && isOpen ? styles.shifted : ''}`}>
        {children}
      </div>
    </>
  );
}
