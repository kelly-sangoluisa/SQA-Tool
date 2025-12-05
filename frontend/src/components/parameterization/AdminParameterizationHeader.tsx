import React from 'react';
import styles from './AdminParameterization.module.css';

interface AdminParameterizationHeaderProps {
  onCreateStandard: () => void;
  loading: boolean;
}

export function AdminParameterizationHeader({ onCreateStandard, loading }: AdminParameterizationHeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Gestión de Parámetros</h1>
      <p className={styles.subtitle}>
        Administra estándares, criterios, sub-criterios y métricas para la evaluación de calidad.
      </p>
      
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Estándares de Calidad</h2>
        <button 
          className={styles.createButton}
          onClick={onCreateStandard}
          disabled={loading}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1V15M1 8H15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Nuevo Estándar
        </button>
      </div>
    </header>
  );
}
