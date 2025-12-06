'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { parameterizationApi, Standard } from '@/api/parameterization/parameterization-api';
import { Button, Loading } from '../shared';
import styles from './StandardSelection.module.css';

interface StandardSelectionProps {
  initialSelectedId?: number;
  onNext: (standard: Standard) => void;
  onBack: () => void;
}

export function StandardSelection({ initialSelectedId, onNext, onBack }: StandardSelectionProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [standards, setStandards] = useState<Standard[]>([]);
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStandards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await parameterizationApi.getStandards({ state: 'active' });
      setStandards(data);

      // Select initial standard if provided
      if (initialSelectedId) {
        const initial = data.find((s) => s.id === initialSelectedId);
        if (initial) setSelectedStandard(initial);
      }
    } catch (err) {
      setError('Error al cargar los estándares. Por favor, intente nuevamente.');
      console.error('Error loading standards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only load standards when authenticated and not loading auth
    if (isAuthenticated && !authLoading) {
      loadStandards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  const handleSelectStandard = (standard: Standard) => {
    setSelectedStandard(standard);
  };

  const handleNext = () => {
    if (selectedStandard) {
      onNext(selectedStandard);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading />
        <p className={styles.loadingText}>Cargando estándares de calidad...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <h3 className={styles.errorTitle}>Error al cargar datos</h3>
          <p className={styles.errorMessage}>{error}</p>
          <Button onClick={loadStandards} variant="primary">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (standards.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyCard}>
          <h3 className={styles.emptyTitle}>No hay estándares disponibles</h3>
          <p className={styles.emptyMessage}>
            No se encontraron estándares de calidad activos en el sistema.
          </p>
          <Button onClick={onBack} variant="outline">
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Seleccione un Estándar de Calidad</h2>
        <p className={styles.subtitle}>
          Elija el estándar de calidad que desea utilizar para esta evaluación
        </p>
      </div>

      <div className={styles.standardsGrid}>
        {standards.map((standard) => (
          <button
            key={standard.id}
            type="button"
            className={`${styles.standardCard} ${
              selectedStandard?.id === standard.id ? styles.selected : ''
            }`}
            onClick={() => handleSelectStandard(standard)}
          >
            <div className={styles.cardHeader}>
              <h3 className={styles.standardName}>{standard.name}</h3>
              <span className={styles.standardVersion}>v{standard.version}</span>
            </div>

            {standard.description && (
              <p className={styles.standardDescription}>{standard.description}</p>
            )}

            {standard.criteria && standard.criteria.length > 0 && (
              <div className={styles.criteriaCount}>
                <svg
                  className={styles.icon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>{standard.criteria.length} criterios disponibles</span>
              </div>
            )}

            {selectedStandard?.id === standard.id && (
              <div className={styles.selectedBadge}>
                <svg
                  className={styles.checkIcon}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Seleccionado
              </div>
            )}
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleNext}
          disabled={!selectedStandard}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
