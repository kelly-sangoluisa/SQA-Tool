'use client';

import { useState, useEffect } from 'react';
import { Criterion } from '@/api/parameterization/parameterization-api';
import { SelectedCriterion } from '@/types/configurationEvaluation.types';
import { Button } from '../shared';
import styles from './SubcriteriaSelection.module.css';

interface SubCriteriaSelectionProps {
  selectedCriteria: Criterion[];
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

  useEffect(() => {
    // Initialize with previous selections if any
    if (initialSelected.length > 0) {
      const initialMap = new Map<number, Set<number>>();
      initialSelected.forEach((sc) => {
        initialMap.set(sc.criterionId, new Set(sc.subCriteriaIds));
      });
      setSelectedSubCriteria(initialMap);
    } else {
      // Select all subcriteria by default
      const defaultMap = new Map<number, Set<number>>();
      selectedCriteria.forEach((criterion) => {
        if (criterion.sub_criteria && criterion.sub_criteria.length > 0) {
          const subIds = criterion.sub_criteria.map((sc) => sc.id);
          defaultMap.set(criterion.id, new Set(subIds));
        }
      });
      setSelectedSubCriteria(defaultMap);
    }
  }, [selectedCriteria, initialSelected]);

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
    const criterion = selectedCriteria.find((c) => c.id === criterionId);
    if (!criterion || !criterion.sub_criteria) return;

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
    const result: SelectedCriterion[] = [];

    selectedCriteria.forEach((criterion) => {
      const subCriteriaIds = selectedSubCriteria.get(criterion.id);
      if (subCriteriaIds && subCriteriaIds.size > 0) {
        const subCriteriaNames =
          criterion.sub_criteria
            ?.filter((sc) => subCriteriaIds.has(sc.id))
            .map((sc) => sc.name) || [];

        result.push({
          criterionId: criterion.id,
          criterionName: criterion.name,
          subCriteriaIds: Array.from(subCriteriaIds),
          subCriteriaNames,
        });
      }
    });

    if (result.length > 0) {
      onNext(result);
    }
  };

  const totalSelected = getSelectedCount();
  const hasSelection = totalSelected > 0;

  return (
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
        {selectedCriteria.map((criterion) => (
          <div key={criterion.id} className={styles.criterionCard}>
            <div className={styles.criterionHeader}>
              <h3 className={styles.criterionName}>{criterion.name}</h3>
              {criterion.sub_criteria && criterion.sub_criteria.length > 0 && (
                <button
                  type="button"
                  className={styles.selectAllButton}
                  onClick={() => handleSelectAllForCriterion(criterion.id)}
                >
                  {(selectedSubCriteria.get(criterion.id)?.size || 0) ===
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
                        checked={isSubCriterionSelected(criterion.id, subCriterion.id)}
                        onChange={() => handleSubCriterionToggle(criterion.id, subCriterion.id)}
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
        ))}
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button type="button" variant="primary" onClick={handleNext} disabled={!hasSelection}>
          Finalizar Configuración
        </Button>
      </div>
    </div>
  );
}
