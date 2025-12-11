import React from 'react';
import { useRouter } from 'next/navigation';
import { HiPlus } from 'react-icons/hi';
import styles from '../DashboardSidebar.module.css';

export function NewEvaluationButton() {
  const router = useRouter();

  return (
    <button 
      className={styles.newEvaluationBtn}
      onClick={() => router.push('/configuration-evaluation')}
    >
      <HiPlus size={20} />
      <span>Nueva Evaluación</span>
    </button>
  );
}
