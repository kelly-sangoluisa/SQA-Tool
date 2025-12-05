'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { parameterizationApi, Criterion } from '@/api/parameterization/parameterization-api';
import { Button, Loading } from '../shared';
import { ImportanceLevel, SelectedCriterion } from '@/types/configurationEvaluation.types';
import styles from './CriteriaOnlySelection.module.css';

interface CriteriaImportanceData {
  importanceLevel: ImportanceLevel;
  importancePercentage: number;
}

export interface CriteriaWithImportance {
  criterionId: number;
  criterion: Criterion;
  importanceLevel: ImportanceLevel;
  importancePercentage: number;
}

interface CriteriaOnlySelectionProps {
  standardId: number;
  initialSelectedIds?: number[];
  onNext: (criteriaWithImportance: CriteriaWithImportance[]) => void;
  onBack: () => void;
}

export function CriteriaOnlySelection({
  standardId,
  initialSelectedIds = [],
  onNext,
  onBack,
}: CriteriaOnlySelectionProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(initialSelectedIds));
  const [criteriaImportance, setCriteriaImportance] = useState<Map<number, CriteriaImportanceData>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    // Only load criteria when authenticated and not loading auth
    if (isAuthenticated && !authLoading) {
      loadCriteria();
    }
  }, [standardId, isAuthenticated, authLoading]);

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
    const newImportance = new Map(criteriaImportance);

    if (newSelected.has(criterionId)) {
      newSelected.delete(criterionId);
      newImportance.delete(criterionId);
    } else {
      newSelected.add(criterionId);
      // Inicializar con valores predeterminados
      newImportance.set(criterionId, {
        importanceLevel: 'M',
        importancePercentage: 0,
      });
    }

    setSelectedIds(newSelected);
    setCriteriaImportance(newImportance);
    setValidationError(null);
  };

  const handleImportanceLevelChange = (criterionId: number, level: ImportanceLevel) => {
    const newImportance = new Map(criteriaImportance);
    const current = newImportance.get(criterionId) || { importanceLevel: 'M', importancePercentage: 0 };
    newImportance.set(criterionId, { ...current, importanceLevel: level });
    setCriteriaImportance(newImportance);
  };

  const handleImportancePercentageChange = (criterionId: number, percentage: number) => {
    const newImportance = new Map(criteriaImportance);
    const current = newImportance.get(criterionId) || { importanceLevel: 'M', importancePercentage: 0 };
    newImportance.set(criterionId, { ...current, importancePercentage: percentage });
    setCriteriaImportance(newImportance);
    setValidationError(null);
  };

  const calculateTotalPercentage = (): number => {
    let total = 0;
    criteriaImportance.forEach((data) => {
      total += data.importancePercentage;
    });
    return total;
  };

  const validateAndProceed = (): boolean => {
    // Verificar que todos los criterios seleccionados tengan datos de importancia
    for (const id of selectedIds) {
      const importance = criteriaImportance.get(id);
      if (!importance || importance.importancePercentage <= 0) {
        setValidationError('Todos los criterios deben tener un porcentaje de importancia mayor a 0');
        return false;
      }
    }

    // Verificar que la suma sea 100%
    const total = calculateTotalPercentage();
    if (Math.abs(total - 100) > 0.01) {
      setValidationError(`La suma de los porcentajes debe ser 100%. Suma actual: ${total.toFixed(2)}%`);
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (selectedIds.size > 0 && validateAndProceed()) {
      const criteriaWithImportance: CriteriaWithImportance[] = Array.from(selectedIds).map((id) => {
        const criterion = criteria.find((c) => c.id === id)!;
        const importance = criteriaImportance.get(id)!;
        return {
          criterionId: id,
          criterion,
          importanceLevel: importance.importanceLevel,
          importancePercentage: importance.importancePercentage,
        };
      });
      onNext(criteriaWithImportance);
    }
  };

  const isNextButtonEnabled = (): boolean => {
    if (selectedIds.size === 0) return false;
    const total = calculateTotalPercentage();
    return Math.abs(total - 100) < 0.01;
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

  const totalPercentage = calculateTotalPercentage();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Seleccione los Criterios</h2>
        <p className={styles.subtitle}>
          Marque los criterios que desea incluir en la evaluación y configure su importancia
        </p>
        {selectedIds.size > 0 && (
          <div className={styles.selectionSummary}>
            <span className={styles.badge}>{selectedIds.size} criterios seleccionados</span>
            <span className={`${styles.percentageBadge} ${Math.abs(totalPercentage - 100) < 0.01 ? styles.valid : styles.invalid}`}>
              Total: {totalPercentage.toFixed(2)}%
            </span>
          </div>
        )}
        {validationError && (
          <div className={styles.validationError}>
            {validationError}
          </div>
        )}
      </div>

      <div className={styles.criteriaList}>
        {criteria.map((criterion) => {
          const isSelected = selectedIds.has(criterion.id);
          const importance = criteriaImportance.get(criterion.id);

          return (
            <div
              key={criterion.id}
              className={`${styles.criterionCard} ${isSelected ? styles.selected : ''}`}
            >
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={isSelected}
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

              {isSelected && importance && (
                <div className={styles.importanceSection}>
                  <div className={styles.importanceField}>
                    <label className={styles.importanceLabel}>
                      Nivel de Importancia <span className={styles.required}>*</span>
                    </label>
                    <select
                      className={styles.importanceSelect}
                      value={importance.importanceLevel}
                      onChange={(e) => handleImportanceLevelChange(criterion.id, e.target.value as ImportanceLevel)}
                    >
                      <option value="A">Alta (A)</option>
                      <option value="M">Media (M)</option>
                      <option value="B">Baja (B)</option>
                    </select>
                  </div>

                  <div className={styles.importanceField}>
                    <label className={styles.importanceLabel}>
                      Porcentaje de Importancia (%) <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="number"
                      className={styles.importanceInput}
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0.00"
                      value={importance.importancePercentage || ''}
                      onChange={(e) => handleImportancePercentageChange(criterion.id, Number(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleNext}
          disabled={!isNextButtonEnabled()}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
