'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { parameterizationApi, Criterion } from '@/api/parameterization/parameterization-api';
import { Button, Loading } from '../shared';
import ValidationModal from '../shared/ValidationModal';
import { ImportanceLevel } from '@/types/configurationEvaluation.types';
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
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [validationModalMessage, setValidationModalMessage] = useState('');

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

  useEffect(() => {
    // Only load criteria when authenticated and not loading auth
    if (isAuthenticated && !authLoading) {
      loadCriteria();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standardId, isAuthenticated, authLoading]);

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
  };

  // Validar si un criterio puede ser seleccionado
  const canSelectCriterion = (criterion: Criterion): boolean => {
    // El criterio debe tener subcriterios
    if (!criterion.sub_criteria || criterion.sub_criteria.length === 0) {
      return false;
    }
    
    // Al menos un subcriterio debe tener métricas
    const hasMetrics = criterion.sub_criteria.some(
      sc => sc.metrics && sc.metrics.length > 0
    );
    
    return hasMetrics;
  };

  // Obtener mensaje de por qué un criterio está deshabilitado
  const getDisabledReason = (criterion: Criterion): string => {
    if (!criterion.sub_criteria || criterion.sub_criteria.length === 0) {
      return 'Sin subcriterios configurados';
    }
    
    const hasMetrics = criterion.sub_criteria.some(
      sc => sc.metrics && sc.metrics.length > 0
    );
    
    if (!hasMetrics) {
      return 'Sin métricas en los subcriterios';
    }
    
    return '';
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
  };

  const calculateTotalPercentage = (): number => {
    let total = 0;
    criteriaImportance.forEach((data) => {
      total += data.importancePercentage;
    });
    return total;
  };

  const validateAndProceed = (): boolean => {
    const criteriaWithoutPercentage: string[] = [];

    for (const id of selectedIds) {
      const importance = criteriaImportance.get(id);
      const criterion = criteria.find(c => c.id === id);

      if (!importance || importance.importancePercentage <= 0) {
        const criterionName = criterion?.name || `Criterio ID ${id}`;
        const subCriteriaInfo = criterion?.sub_criteria && criterion.sub_criteria.length > 0
          ? ` (${criterion.sub_criteria.length} ${criterion.sub_criteria.length === 1 ? 'subcriterio' : 'subcriterios'})`
          : '';
        criteriaWithoutPercentage.push(`• ${criterionName}${subCriteriaInfo}`);
      }
    }

    if (criteriaWithoutPercentage.length > 0) {
      const message = `Los siguientes criterios necesitan un porcentaje de importancia mayor a 0:\n\n${criteriaWithoutPercentage.join('\n')}\n\nPor favor, asigne un porcentaje a cada criterio.`;
      setValidationModalMessage(message);
      setValidationModalOpen(true);
      return false;
    }

    const total = calculateTotalPercentage();
    if (Math.abs(total - 100) > 0.01) {
      const difference = total - 100;
      const message = `La suma de los porcentajes de importancia debe ser exactamente 100%.\n\nSuma actual: ${total.toFixed(2)}%\n${difference > 0 ? `Sobran: ${difference.toFixed(2)}%` : `Faltan: ${Math.abs(difference).toFixed(2)}%`}\n\nPor favor, ajuste los porcentajes para que sumen exactamente 100%.`;
      setValidationModalMessage(message);
      setValidationModalOpen(true);
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
      </div>

      <ValidationModal
        open={validationModalOpen}
        title="Validación de Importancia"
        message={validationModalMessage}
        onClose={() => setValidationModalOpen(false)}
      />

      <div className={styles.criteriaList}>
        {criteria.map((criterion) => {
          const isSelected = selectedIds.has(criterion.id);
          const importance = criteriaImportance.get(criterion.id);
          const canSelect = canSelectCriterion(criterion);
          const disabledReason = getDisabledReason(criterion);

          return (
            <div
              key={criterion.id}
              className={`${styles.criterionCard} ${isSelected ? styles.selected : ''} ${!canSelect ? styles.disabled : ''}`}
              title={!canSelect ? disabledReason : undefined}
            >
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={isSelected}
                  onChange={() => canSelect && handleToggle(criterion.id)}
                  disabled={!canSelect}
                />
                <div className={styles.criterionContent}>
                  <span className={styles.criterionName}>{criterion.name}</span>
                  {criterion.description && (
                    <p className={styles.criterionDescription}>{criterion.description}</p>
                  )}
                  {criterion.sub_criteria && criterion.sub_criteria.length > 0 ? (
                    <div className={styles.subCriteriaInfo}>
                      <span className={styles.subCriteriaCount}>
                        {criterion.sub_criteria.length} subcriterios
                      </span>
                      {criterion.sub_criteria.map(sc => {
                        const metricsCount = sc.metrics ? sc.metrics.length : 0;
                        const hasFormulas = sc.metrics && sc.metrics.some(m => m.formula);
                        return (
                          <div key={sc.id} className={styles.subcriterionDetail}>
                            <span className={styles.subcriterionName}>{sc.name}</span>
                            <span className={`${styles.metricsCount} ${metricsCount > 0 ? styles.hasMetrics : styles.noMetrics}`}>
                              {metricsCount} métrica{metricsCount !== 1 ? 's' : ''}
                              {hasFormulas && metricsCount > 0 && ' ✓'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className={`${styles.subCriteriaCount} ${styles.noSubcriteria}`}>
                      ⚠️ Sin subcriterios configurados
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
