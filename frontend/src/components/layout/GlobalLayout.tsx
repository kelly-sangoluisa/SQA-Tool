"use client";
import { useAuth } from '@/hooks/auth/useAuth';
import { DashboardSidebar, useSidebar } from '@/components/dashboard/sidebar';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './GlobalLayout.module.css';

export function GlobalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, isLoading } = useAuth();
  const { isOpen } = useSidebar();
  const pathname = usePathname();

  const [shouldShowSidebar, setShouldShowSidebar] = useState(false);

  useEffect(() => {
    const excludePaths = ['/', '/auth/login', '/auth/register', '/auth/signup', '/auth/forgot-password', '/parameterization'];
    const showSidebar = !isLoading &&
                        user?.role?.name !== 'admin' &&
                        !excludePaths.some(path => pathname === path || pathname?.startsWith(path + '/'));
    setShouldShowSidebar(showSidebar);
  }, [isLoading, user, pathname]);

  return (
    <>
      {shouldShowSidebar && <DashboardSidebar />}
      <div className={`${styles.mainContent} ${shouldShowSidebar && isOpen ? styles.shifted : ''}`}>
        {children}
      </div>
    </>
  );
}
