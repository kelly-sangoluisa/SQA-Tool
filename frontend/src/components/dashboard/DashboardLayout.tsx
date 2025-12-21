"use client";
import Image from 'next/image';
import { useAuth } from '../../hooks/auth/useAuth';
import { DashboardSidebar } from './sidebar/DashboardSidebar';
import { useSidebar } from './sidebar/context/SidebarContext';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: Readonly<DashboardLayoutProps>) {
  const { user } = useAuth();
  const { isOpen } = useSidebar();

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDashboardTitle = () => {
    if (!user?.role) return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Image src="/logo-SQATool.png" alt="SQA Tool" width={32} height={32} />
        <span>Dashboard SQA Tool</span>
      </div>
    );
    
    if (user.role.name === 'admin') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Image src="/logo-SQATool.png" alt="SQA Tool" width={32} height={32} />
          <span>Panel de Administración - SQA Tool</span>
        </div>
      );
    } else {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Image src="/logo-SQATool.png" alt="SQA Tool" width={32} height={32} />
          <span>Dashboard SQA Tool</span>
        </div>
      );
    }
  };

  return (
    <div className={`${styles.root} ${isOpen ? styles.sidebarOpen : ''}`}>
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerInner}>
            <div className={styles.brand}>
              <h1 className={styles.title}>{getDashboardTitle()}</h1>
            </div>

            {/* User Section */}
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
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  );
}