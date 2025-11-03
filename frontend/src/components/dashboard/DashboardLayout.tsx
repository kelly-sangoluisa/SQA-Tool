"use client";
import { useAuth } from '../../hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error durante el logout:', error);
      router.replace('/auth/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={styles.root}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerInner}>
            <div className={styles.brand}>
              <h1 className={styles.title}>🎉 Dashboard SQA Tool</h1>
            </div>

            <div className={styles.userSection}>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>
                  {user ? getUserInitials(user.name) : 'U'}
                </div>
                <div className={styles.userDetails}>
                  <span className={styles.userName}>{user?.name}</span>
                  <span className={styles.userRole}>{user?.role?.name}</span>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className={styles.logoutBtn}
              >
                {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  );
}