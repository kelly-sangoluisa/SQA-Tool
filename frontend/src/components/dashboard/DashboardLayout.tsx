"use client";
import { useAuth } from '../../hooks/auth/useAuth';
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

  const getNavigationOptions = () => {
    if (!user || !user.role) return [];

    if (user.role.name === 'admin') {
      return [
        { 
          label: 'Parametrización', 
          href: '/parameterization',
          description: 'Gestionar estándares y criterios'
        }
      ];
    } else {
      return [
        { 
          label: 'Dashboard', 
          href: '/dashboard',
          description: 'Vista general de proyectos'
        },
        { 
          label: 'Nueva Evaluación', 
          href: '/configuration-evaluation',
          description: 'Configurar nueva evaluación'
        }
      ];
    }
  };

  const getDashboardTitle = () => {
    if (!user || !user.role) return 'Dashboard SQA Tool';
    
    if (user.role.name === 'admin') {
      return '🔧 Panel de Administración - SQA Tool';
    } else {
      return '🎉 Dashboard SQA Tool';
    }
  };

  const navigationOptions = getNavigationOptions();

  return (
    <div className={styles.root}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerInner}>
            <div className={styles.brand}>
              <h1 className={styles.title}>{getDashboardTitle()}</h1>
              {user?.role?.name === 'admin' && (
                <p className={styles.subtitle}>Gestiona la configuración del sistema</p>
              )}
            </div>

            {/* Navigation Menu for larger screens */}
            {navigationOptions.length > 0 && (
              <nav className={styles.navigation}>
                {navigationOptions.map((option) => (
                  <a
                    key={option.href}
                    href={option.href}
                    className={styles.navLink}
                    title={option.description}
                  >
                    {option.label}
                  </a>
                ))}
              </nav>
            )}

            <div className={styles.userSection}>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>
                  {user ? getUserInitials(user.name) : 'U'}
                </div>
                <div className={styles.userDetails}>
                  <span className={styles.userName}>{user?.name}</span>
                  <span className={`${styles.userRole} ${user?.role?.name === 'admin' ? styles.adminRole : styles.evaluatorRole}`}>
                    {user?.role?.name === 'admin' ? 'Administrador' : 'Evaluador'}
                  </span>
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

      {/* Mobile Navigation */}
      {navigationOptions.length > 0 && (
        <nav className={styles.mobileNavigation}>
          {navigationOptions.map((option) => (
            <a
              key={option.href}
              href={option.href}
              className={styles.mobileNavLink}
            >
              <span className={styles.mobileNavLabel}>{option.label}</span>
              <span className={styles.mobileNavDesc}>{option.description}</span>
            </a>
          ))}
        </nav>
      )}

      <main className={styles.main}>{children}</main>
    </div>
  );
}