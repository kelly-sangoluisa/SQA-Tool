'use client';

import { useState, useEffect } from 'react';
import { Criterion } from '@/api/parameterization/parameterization-api';
import { SelectedCriterion, ImportanceLevel } from '@/types/configurationEvaluation.types';
import { Button } from '../shared';
import AlertBanner from '../shared/AlertBanner';
import styles from './SubCriteriaSelection.module.css';
import { CriteriaWithImportance } from './CriteriaOnlySelection';

interface SubCriteriaSelectionProps {
  selectedCriteria: Criterion[] | CriteriaWithImportance[];
  initialSelected?: SelectedCriterion[];
  onNext: (selectedCriteria: SelectedCriterion[]) => void;
  onBack: () => void;
}

export function SubCriteriaSelection({
  selectedCriteria,
  initialSelected = [],
  onNext,
  onBack,
}: SubCriteriaSelectionProps) {
  const [selectedSubCriteria, setSelectedSubCriteria] = useState<Map<number, Set<number>>>(
    new Map()
  );
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'error' | 'warning' | 'success'>('error');

useEffect(() => {
  // 1. Si viene selección previa (volver atrás), usarla SOLO una vez
  if (initialSelected.length > 0 && selectedSubCriteria.size === 0) {
    const initialMap = new Map<number, Set<number>>();
    initialSelected.forEach((sc) => {
      initialMap.set(sc.criterionId, new Set(sc.subCriteriaIds));
    });
    setSelectedSubCriteria(initialMap);
    return;
  }

  // 2. Si no hay selección previa, seleccionar todo por defecto SOLO una vez
  if (selectedCriteria.length > 0 && selectedSubCriteria.size === 0) {
    const defaultMap = new Map<number, Set<number>>();

    selectedCriteria.forEach((item) => {
      const isCriteriaWithImportance = 'criterionId' in item;
      const criterion = isCriteriaWithImportance ? item.criterion : item;
      const criterionId = isCriteriaWithImportance ? item.criterionId : item.id;

      if (criterion.sub_criteria && criterion.sub_criteria.length > 0) {
        defaultMap.set(
          criterionId,
          new Set(criterion.sub_criteria.map((sc) => sc.id))
        );
      }
    });

    setSelectedSubCriteria(defaultMap);
  }
}, [selectedCriteria]); 


  const handleSubCriterionToggle = (criterionId: number, subCriterionId: number) => {
    const newSelected = new Map(selectedSubCriteria);
    const subCriteria = newSelected.get(criterionId) || new Set();

    if (subCriteria.has(subCriterionId)) {
      subCriteria.delete(subCriterionId);
    } else {
      subCriteria.add(subCriterionId);
    }

    if (subCriteria.size > 0) {
      newSelected.set(criterionId, subCriteria);
    } else {
      newSelected.delete(criterionId);
    }

    setSelectedSubCriteria(newSelected);
  };

  const handleSelectAllForCriterion = (criterionId: number) => {
    const item = selectedCriteria.find((item) => {
      const isCriteriaWithImportance = 'criterionId' in item;
      const id = isCriteriaWithImportance ? item.criterionId : item.id;
      return id === criterionId;
    });

    if (!item) return;

    const isCriteriaWithImportance = 'criterionId' in item;
    const criterion = isCriteriaWithImportance ? item.criterion : item;

    if (!criterion.sub_criteria) return;

    const newSelected = new Map(selectedSubCriteria);
    const allSubIds = criterion.sub_criteria.map((sc) => sc.id);
    const currentSelected = newSelected.get(criterionId) || new Set();

    if (currentSelected.size === allSubIds.length) {
      // Deselect all
      newSelected.delete(criterionId);
    } else {
      // Select all
      newSelected.set(criterionId, new Set(allSubIds));
    }

    setSelectedSubCriteria(newSelected);
  };

  const isSubCriterionSelected = (criterionId: number, subCriterionId: number): boolean => {
    return selectedSubCriteria.get(criterionId)?.has(subCriterionId) || false;
  };

  const getSelectedCount = (): number => {
    let count = 0;
    selectedSubCriteria.forEach((subCriteria) => {
      count += subCriteria.size;
    });
    return count;
  };

  const handleNext = () => {
    const totalSelected = getSelectedCount();

    if (selectedSubCriteria.size === 0 || totalSelected === 0) {
      setAlertMessage('Debe seleccionar al menos un subcriterio para continuar.');
      setAlertType('error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setAlertMessage(null);

    const result: SelectedCriterion[] = [];

    selectedCriteria.forEach((item) => {
      // Check if it's a CriteriaWithImportance or just a Criterion
      const isCriteriaWithImportance = 'criterionId' in item;
      const criterion = isCriteriaWithImportance ? item.criterion : item;
      const criterionId = isCriteriaWithImportance ? item.criterionId : item.id;
      const importanceLevel = isCriteriaWithImportance ? item.importanceLevel : ('M' as ImportanceLevel);
      const importancePercentage = isCriteriaWithImportance ? item.importancePercentage : 0;

      const subCriteriaIds = selectedSubCriteria.get(criterionId);
      if (subCriteriaIds && subCriteriaIds.size > 0) {
        const subCriteriaNames =
          criterion.sub_criteria
            ?.filter((sc) => subCriteriaIds.has(sc.id))
            .map((sc) => sc.name) || [];

        result.push({
          criterionId: criterionId,
          criterionName: criterion.name,
          subCriteriaIds: Array.from(subCriteriaIds),
          subCriteriaNames,
          importanceLevel,
          importancePercentage,
        });
      }
    });

    if (result.length === 0) {
      setAlertMessage('Debe seleccionar al menos un subcriterio para continuar.');
      setAlertType('error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Solo pasar los datos al siguiente paso, NO crear nada en la BD
    onNext(result);
  };

  const totalSelected = getSelectedCount();
  const hasSelection = totalSelected > 0;

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
        <h2 className={styles.title}>Seleccione los Subcriterios</h2>
        <p className={styles.subtitle}>
          Para cada criterio seleccionado, elija los subcriterios que desea evaluar
        </p>
        {hasSelection && (
          <div className={styles.selectionSummary}>
            <span className={styles.badge}>{totalSelected} subcriterios seleccionados</span>
          </div>
        )}
      </div>

      <div className={styles.criteriaList}>
        {selectedCriteria.map((item) => {
          const isCriteriaWithImportance = 'criterionId' in item;
          const criterion = isCriteriaWithImportance ? item.criterion : item;
          const criterionId = isCriteriaWithImportance ? item.criterionId : item.id;

          return (
            <div key={criterionId} className={styles.criterionCard}>
              <div className={styles.criterionHeader}>
                <h3 className={styles.criterionName}>{criterion.name}</h3>
                {criterion.sub_criteria && criterion.sub_criteria.length > 0 && (
                  <button
                    type="button"
                    className={styles.selectAllButton}
                    onClick={() => handleSelectAllForCriterion(criterionId)}
                  >
                    {(selectedSubCriteria.get(criterionId)?.size || 0) ===
                    criterion.sub_criteria.length
                      ? 'Desmarcar todos'
                      : 'Seleccionar todos'}
                  </button>
                )}
              </div>

              {criterion.description && (
                <p className={styles.criterionDescription}>{criterion.description}</p>
              )}

              {criterion.sub_criteria && criterion.sub_criteria.length > 0 ? (
                <div className={styles.subCriteriaList}>
                  {criterion.sub_criteria.map((subCriterion) => (
                    <div key={subCriterion.id} className={styles.subCriterionItem}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={isSubCriterionSelected(criterionId, subCriterion.id)}
                          onChange={() => handleSubCriterionToggle(criterionId, subCriterion.id)}
                        />
                        <div className={styles.subCriterionContent}>
                          <span className={styles.subCriterionName}>{subCriterion.name}</span>
                          {subCriterion.description && (
                            <p className={styles.subCriterionDescription}>
                              {subCriterion.description}
                            </p>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.noSubCriteria}>Este criterio no tiene subcriterios disponibles</p>
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
          disabled={!hasSelection}
        >
          Siguiente
        </Button>
      </div>
      </div>
    </div>
  );
}
