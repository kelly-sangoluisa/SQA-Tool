import React from 'react';
import { useRouter } from 'next/navigation';
import { HiHome } from 'react-icons/hi';
import styles from '../DashboardSidebar.module.css';

export function BackToHomeButton() {
  const router = useRouter();

  return (
    <button 
      className={styles.backToHomeBtn}
      onClick={() => router.push('/dashboard')}
      title="Ir al Dashboard"
    >
      <HiHome size={20} />
      <span>Dashboard</span>
    </button>
  );
}
