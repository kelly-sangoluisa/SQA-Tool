"use client";
import { useAuth } from '../../hooks/auth/useAuth';
import { Button } from '../shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: Readonly<DashboardLayoutProps>) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      // No necesitamos hacer router.push aquí, useAuth ya maneja la redirección
    } catch (error) {
      console.error('Error durante el logout:', error);
      // En caso de error, forzar redirección al login
      router.replace('/auth/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = (name: string) => {
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
              <h1 className={styles.title}>{process.env.NEXT_PUBLIC_APP_NAME || 'SQA Tool'}</h1>
            </div>

            <div className={styles.userSection}>
              <div className={styles.brand}>
                <div className={styles.avatar}>
                  <span>{user ? getUserInitials(user.name) : 'U'}</span>
                </div>
                <div className={styles.userInfo}>
                  <p style={{ fontSize: '.875rem', fontWeight: 600 }}>{user?.name}</p>
                  <p style={{ fontSize: '.75rem', color: '#6b7280' }}>{user?.role.name}</p>
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={handleSignOut}
                size="sm"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation breadcrumb */}
      <nav className={styles.breadcrumb}>
        <div className={styles.container}>
          <div className={styles.breadcrumbInner}>
            <ol style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '.875rem' }}>
              <li>
                <a href="/dashboard" style={{ color: '#2563eb', textDecoration: 'none' }}>Dashboard</a>
              </li>
            </ol>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className={styles.main}>{children}</main>
    </div>
  );
}