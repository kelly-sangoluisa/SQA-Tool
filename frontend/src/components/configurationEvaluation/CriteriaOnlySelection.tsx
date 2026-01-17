'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { parameterizationApi, Criterion } from '@/api/parameterization/parameterization-api';
import { Button, Loading } from '../shared';
import AlertBanner from '../shared/AlertBanner';
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
  readonly standardId: number;
  readonly initialSelectedIds?: number[];
  readonly onNext: (criteriaWithImportance: CriteriaWithImportance[]) => void;
  readonly onBack: () => void;
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
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'error' | 'warning' | 'success'>('error');

  useEffect(() => {
    // Scroll al AlertBanner cuando aparezca
    if (alertMessage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [alertMessage]);

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
    // Redondear a 2 decimales para evitar problemas de precisión
    const roundedPercentage = Math.round(percentage * 100) / 100;
    newImportance.set(criterionId, { ...current, importancePercentage: roundedPercentage });
    setCriteriaImportance(newImportance);
  };

  const calculateTotalPercentage = (): number => {
    let total = 0;
    criteriaImportance.forEach((data) => {
      total += data.importancePercentage;
    });
    // Redondear a 2 decimales para evitar problemas de precisión
    return Math.round(total * 100) / 100;
  };

  const validateAndProceed = (): boolean => {
    // Validar que hay criterios seleccionados
    if (selectedIds.size === 0) {
      const msg = 'Debe seleccionar al menos un criterio para continuar.';
      setAlertMessage(msg);
      setAlertType('error');
      return false;
    }

    const criteriaWithoutPercentage: string[] = [];

    // Validar que cada criterio seleccionado tenga un porcentaje asignado
    for (const id of selectedIds) {
      const importance = criteriaImportance.get(id);
      const criterion = criteria.find(c => c.id === id);

      if (!importance || importance.importancePercentage <= 0) {
        const criterionName = criterion?.name || `Criterio ID ${id}`;
        criteriaWithoutPercentage.push(criterionName);
      }
    }

    if (criteriaWithoutPercentage.length > 0) {
      const message = `Los siguientes criterios necesitan un porcentaje mayor a 0: ${criteriaWithoutPercentage.join(', ')}.`;
      setAlertMessage(message);
      setAlertType('error');
      return false;
    }

    // Validar que la suma sea exactamente 100%
    const total = calculateTotalPercentage();
    if (total !== 100) {
      const difference = total - 100;
      const message = difference > 0 
        ? `La suma de los porcentajes es ${total}%. Debe ajustar los valores para que sumen exactamente 100%. Sobran ${difference}%.`
        : `La suma de los porcentajes es ${total}%. Debe ajustar los valores para que sumen exactamente 100%. Faltan ${Math.abs(difference)}%.`;
      setAlertMessage(message);
      setAlertType('warning');
      return false;
    }

    // Limpiar alerta si pasó todas las validaciones
    setAlertMessage(null);
    return true;
  };

  const handleNext = () => {
    // Siempre validar antes de continuar, sin importar si el botón está habilitado
    if (!validateAndProceed()) {
      return; // La validación ya configuró el mensaje de alerta
    }

    // Si pasó la validación, continuar
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
    <div className={styles.pageWrapper}>
      {/* Banner de alerta - Pegado arriba */}
      {alertMessage && (
        <div className={styles.alertContainer}>
          <AlertBanner
            type={alertType}
            message={alertMessage}
            onClose={() => setAlertMessage(null)}
            visible={!!alertMessage}
          />
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Seleccione los Criterios</h2>
          <p className={styles.subtitle}>
            Marque los criterios que desea incluir en la evaluación y configure su importancia
          </p>
        
          {selectedIds.size > 0 && (
            <div className={styles.selectionSummary}>
              <span className={styles.badge}>{selectedIds.size} criterios seleccionados</span>
              <span className={`${styles.percentageBadge} ${calculateTotalPercentage() === 100 ? styles.valid : styles.invalid}`}>
                Total: {calculateTotalPercentage()}%
              </span>
            </div>
          )}
        </div>

        <div className={styles.criteriaList}>
        {criteria.map((criterion) => {
          const isSelected = selectedIds.has(criterion.id);
          const importance = criteriaImportance.get(criterion.id);
          const canSelect = canSelectCriterion(criterion);
          const disabledReason = getDisabledReason(criterion);

          return (
            <div
              key={criterion.id}
              className={`${styles.criterionCard} ${isSelected ? styles.selected : ''} ${canSelect ? '' : styles.disabled}`}
              title={canSelect ? undefined : disabledReason}
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
                        const metricsCount = sc.metrics?.length ?? 0;
                        const hasFormulas = sc.metrics?.some(m => m.formula);
                        return (
                          <div key={sc.id} className={styles.subcriterionDetail}>
                            <span className={styles.subcriterionName}>{sc.name}</span>
                            <span className={`${styles.metricsCount} ${metricsCount > 0 ? styles.hasMetrics : styles.noMetrics}`}>
                              {metricsCount} métrica{metricsCount === 1 ? '' : 's'}
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

              {isSelected && (
                <div className={styles.importanceSection}>
                  <div className={styles.importanceField}>
                    <label htmlFor={`importance-level-${criterion.id}`} className={styles.importanceLabel}>
                      Nivel de Importancia <span className={styles.required}>*</span>
                    </label>
                    <select
                      id={`importance-level-${criterion.id}`}
                      className={styles.importanceSelect}
                      value={importance?.importanceLevel || 'M'}
                      onChange={(e) => handleImportanceLevelChange(criterion.id, e.target.value as ImportanceLevel)}
                    >
                      <option value="A">Alta (A)</option>
                      <option value="M">Media (M)</option>
                      <option value="B">Baja (B)</option>
                    </select>
                  </div>

                  <div className={styles.importanceField}>
                    <label htmlFor={`importance-percentage-${criterion.id}`} className={styles.importanceLabel}>
                      Porcentaje de Importancia (%) <span className={styles.required}>*</span>
                    </label>
                    <input
                      id={`importance-percentage-${criterion.id}`}
                      type="number"
                      className={styles.importanceInput}
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0.00"
                      value={importance?.importancePercentage || ''}
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
          disabled={selectedIds.size === 0}
        >
          Continuar
        </Button>
        </div>
      </div>
    </div>
  );
}
