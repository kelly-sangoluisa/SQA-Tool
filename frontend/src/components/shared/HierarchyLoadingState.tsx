import React from 'react';
import styles from './HierarchyLoadingState.module.css';

interface HierarchyLoadingStateProps {
  /** Mensaje de carga a mostrar */
  readonly message?: string;
  /** Tamaño del spinner: 'small', 'medium', 'large' */
  readonly size?: 'small' | 'medium' | 'large';
  /** Mostrar puntos animados después del mensaje */
  readonly showDots?: boolean;
}

/**
 * Componente de estado de carga reutilizable con animaciones suaves
 * Específicamente diseñado para componentes de jerarquía
 */
export function HierarchyLoadingState({ 
  message = 'Cargando', 
  size = 'medium',
  showDots = true 
}: HierarchyLoadingStateProps) {
  return (
    <div className={`${styles.loadingContainer} ${styles[size]}`}>
      <div className={styles.spinnerWrapper}>
        <div className={styles.spinner}></div>
        <div className={styles.spinnerInner}></div>
      </div>
      <p className={styles.loadingText}>
        {message}
        {showDots && (
          <span className={styles.dots}>
            <span className={styles.dot}>.</span>
            <span className={styles.dot}>.</span>
            <span className={styles.dot}>.</span>
          </span>
        )}
      </p>
    </div>
  );
}
