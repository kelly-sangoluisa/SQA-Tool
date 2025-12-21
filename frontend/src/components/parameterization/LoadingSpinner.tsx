import React from 'react';
import styles from './AdminParameterization.module.css';

interface LoadingSpinnerProps {
  readonly message?: string;
}

export function LoadingSpinner({ message = 'Cargando...' }: LoadingSpinnerProps) {
  return (
    <div className={styles.loading}>
      <div className={styles.loadingSpinner}></div>
      <p>{message}</p>
    </div>
  );
}
