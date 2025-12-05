"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/auth/useAuth';
import { parameterizationApi, Standard } from '../../api/parameterization/parameterization-api';
import { StandardDetailView } from './StandardDetailView';
import { StandardFormDrawer } from './StandardFormDrawer';
import styles from './AdminParameterization.module.css';

export function AdminParameterization() {
  const { user } = useAuth();
  const [standards, setStandards] = useState<Standard[]>([]);
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadStandards();
  }, []);

  const loadStandards = async () => {
    setLoading(true);
    try {
      // Load all standards including inactive ones
      const data = await parameterizationApi.getStandards({ state: 'all' });
      setStandards(data);
    } catch (error) {
      console.error('Error loading standards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStandardState = async (standard: Standard) => {
    try {
      const newState = standard.state === 'active' ? 'inactive' : 'active';
      await parameterizationApi.updateStandardState(standard.id, { state: newState });
      // Reload standards to reflect the change
      loadStandards();
    } catch (error) {
      console.error('Error updating standard state:', error);
    }
  };

  const handleStandardSelect = (standard: Standard) => {
    setSelectedStandard(standard);
  };

  const handleBackToStandards = () => {
    setSelectedStandard(null);
  };

  const handleCreateStandard = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleStandardSaved = () => {
    loadStandards();
    handleCloseForm();
  };

  // If a standard is selected, show the detail view
  if (selectedStandard) {
    return (
      <StandardDetailView 
        standard={selectedStandard} 
        onBack={handleBackToStandards}
      />
    );
  }

  // Otherwise, show the standards grid (Level 1)
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Gestión de Parámetros</h1>
        <p className={styles.subtitle}>
          Administra estándares, criterios, sub-criterios y métricas para la evaluación de calidad.
        </p>
      </header>

      <div className={styles.content}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Estándares de Calidad</h2>
          <button 
            className={styles.createButton}
            onClick={handleCreateStandard}
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
        
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Cargando estándares...</p>
          </div>
        ) : (
          <div className={styles.standardsGrid}>
            {standards.map((standard) => (
              <div 
                key={standard.id} 
                className={styles.standardCard}
                onClick={() => handleStandardSelect(standard)}
              >
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{standard.name}</h3>
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStandardState(standard);
                      }}
                      className={`${styles.toggleButton} ${standard.state === 'active' ? styles.active : styles.inactive}`}
                      title={`${standard.state === 'active' ? 'Desactivar' : 'Activar'} estándar`}
                    >
                      <div className={styles.toggleSlider}></div>
                    </button>
                    <span className={`${styles.status} ${styles[standard.state]}`}>
                      {standard.state}
                    </span>
                  </div>
                </div>
                
                <p className={styles.cardDescription}>
                  {standard.description || 'Sin descripción disponible'}
                </p>
                
                <div className={styles.cardMeta}>
                  <span className={styles.version}>v{standard.version}</span>
                  <span className={styles.date}>
                    {new Date(standard.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className={styles.cardFooter}>
                  <button className={styles.viewButton}>
                    Ver Detalle
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M6 12L10 8L6 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && standards.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📊</div>
            <h3>No hay estándares definidos</h3>
            <p>Comienza creando el primer estándar de calidad para tu organización.</p>
            <button className={styles.emptyButton}>Crear Primer Estándar</button>
          </div>
        )}
      </div>
      
      {isFormOpen && (
        <StandardFormDrawer
          onClose={handleCloseForm}
          onSave={handleStandardSaved}
        />
      )}
    </div>
  );
}