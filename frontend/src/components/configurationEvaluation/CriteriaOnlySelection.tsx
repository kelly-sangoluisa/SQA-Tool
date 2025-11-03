'use client';

import { useState, useEffect } from 'react';
import { parameterizationApi, Criterion } from '@/api/parameterization/parameterization-api';
import { Button, Loading } from '../shared';
import styles from './CriteriaOnlySelection.module.css';

interface CriteriaOnlySelectionProps {
  standardId: number;
  initialSelectedIds?: number[];
  onNext: (selectedCriteriaIds: number[], criteria: Criterion[]) => void;
  onBack: () => void;
}

export function CriteriaOnlySelection({
  standardId,
  initialSelectedIds = [],
  onNext,
  onBack,
}: CriteriaOnlySelectionProps) {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(initialSelectedIds));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCriteria();
  }, [standardId]);

  const loadCriteria = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await parameterizationApi.getCriteriaByStandard(standardId, { state: 'active' });
      setCriteria(data);
    } catch (err) {
      setError('Error al cargar los criterios. Por favor, intente nuevamente.');
      console.error('Error loading criteria:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (criterionId: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(criterionId)) {
      newSelected.delete(criterionId);
    } else {
      newSelected.add(criterionId);
    }
    setSelectedIds(newSelected);
  };

  const handleNext = () => {
    if (selectedIds.size > 0) {
      const selectedCriteria = criteria.filter((c) => selectedIds.has(c.id));
      onNext(Array.from(selectedIds), selectedCriteria);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading />
        <p className={styles.loadingText}>Cargando criterios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <h3 className={styles.errorTitle}>Error al cargar datos</h3>
          <p className={styles.errorMessage}>{error}</p>
          <Button onClick={loadCriteria} variant="primary">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (criteria.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyCard}>
          <h3 className={styles.emptyTitle}>No hay criterios disponibles</h3>
          <p className={styles.emptyMessage}>
            No se encontraron criterios activos para este estándar.
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
        <h2 className={styles.title}>Seleccione los Criterios</h2>
        <p className={styles.subtitle}>
          Marque los criterios que desea incluir en la evaluación
        </p>
        {selectedIds.size > 0 && (
          <div className={styles.selectionSummary}>
            <span className={styles.badge}>{selectedIds.size} criterios seleccionados</span>
          </div>
        )}
      </div>

      <div className={styles.criteriaList}>
        {criteria.map((criterion) => (
          <div
            key={criterion.id}
            className={`${styles.criterionCard} ${
              selectedIds.has(criterion.id) ? styles.selected : ''
            }`}
          >
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={selectedIds.has(criterion.id)}
                onChange={() => handleToggle(criterion.id)}
              />
              <div className={styles.criterionContent}>
                <span className={styles.criterionName}>{criterion.name}</span>
                {criterion.description && (
                  <p className={styles.criterionDescription}>{criterion.description}</p>
                )}
                {criterion.sub_criteria && criterion.sub_criteria.length > 0 && (
                  <span className={styles.subCriteriaCount}>
                    {criterion.sub_criteria.length} subcriterios disponibles
                  </span>
                )}
              </div>
            </label>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button type="button" variant="primary" onClick={handleNext} disabled={selectedIds.size === 0}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
