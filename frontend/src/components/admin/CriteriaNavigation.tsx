import React, { useState, useEffect } from 'react';
import { 
  Criterion, 
  SubCriterion, 
  parameterizationApi
} from '../../api/parameterization/parameterization-api';
import styles from './CriteriaNavigation.module.css';

interface CriteriaNavigationProps {
  onRefresh?: () => void;
  standardId?: number;
  onCriterionSelect?: (criterion: Criterion) => void;
  onSubCriterionSelect?: (criterion: Criterion, subCriterion: SubCriterion) => void;
}

export function CriteriaNavigation({
  onRefresh,
  standardId,
  onCriterionSelect,
  onSubCriterionSelect
}: CriteriaNavigationProps) {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [subCriteria, setSubCriteria] = useState<Record<number, SubCriterion[]>>({});
  const [expandedCriteria, setExpandedCriteria] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingSubCriteria, setLoadingSubCriteria] = useState<Set<number>>(new Set());
  const [toggleLoading, setToggleLoading] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (standardId) {
      loadCriteria();
    }
  }, [standardId]);

  const loadCriteria = async () => {
    if (!standardId) return;
    
    setLoading(true);
    try {
      const data = await parameterizationApi.getCriteriaByStandard(standardId, { state: 'all' });
      setCriteria(data);
    } catch (error) {
      console.error('Error loading criteria:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubCriteria = async (criterionId: number) => {
    if (subCriteria[criterionId]) return;

    setLoadingSubCriteria(prev => new Set([...prev, criterionId]));
    try {
      const criterion = await parameterizationApi.getCriterionById(criterionId);
      const subCriteriaData = criterion.sub_criteria || [];
      setSubCriteria(prev => ({
        ...prev,
        [criterionId]: subCriteriaData
      }));
    } catch (error) {
      console.error('Error loading subcriteria:', error);
    } finally {
      setLoadingSubCriteria(prev => {
        const newSet = new Set(prev);
        newSet.delete(criterionId);
        return newSet;
      });
    }
  };

  const toggleCriterionExpansion = async (criterion: Criterion) => {
    const isExpanded = expandedCriteria.has(criterion.id);
    const newExpanded = new Set(expandedCriteria);

    if (isExpanded) {
      newExpanded.delete(criterion.id);
    } else {
      newExpanded.add(criterion.id);
      await loadSubCriteria(criterion.id);
    }

    setExpandedCriteria(newExpanded);
    onCriterionSelect?.(criterion);
  };

  const toggleCriterionState = async (criterion: Criterion, e: React.MouseEvent) => {
    e.stopPropagation();
    const toggleKey = `criterion-${criterion.id}`;
    
    if (toggleLoading.has(toggleKey)) return;

    setToggleLoading(prev => new Set([...prev, toggleKey]));
    try {
      const newState = criterion.state === 'active' ? 'inactive' : 'active';
      await parameterizationApi.updateCriterionState(criterion.id, { state: newState });
      await loadCriteria();
      onRefresh?.();
    } catch (error) {
      console.error('Error updating criterion state:', error);
    } finally {
      setToggleLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(toggleKey);
        return newSet;
      });
    }
  };

  const toggleSubCriterionState = async (subCriterion: SubCriterion, e: React.MouseEvent) => {
    e.stopPropagation();
    const toggleKey = `subcriterion-${subCriterion.id}`;
    
    if (toggleLoading.has(toggleKey)) return;

    setToggleLoading(prev => new Set([...prev, toggleKey]));
    try {
      const newState = subCriterion.state === 'active' ? 'inactive' : 'active';
      await parameterizationApi.updateSubCriterionState(subCriterion.id, { state: newState });
      
      // Refresh the subcriteria for this criterion
      const criterionId = subCriterion.criterion_id;
      setSubCriteria(prev => {
        const updated = { ...prev };
        delete updated[criterionId];
        return updated;
      });
      await loadSubCriteria(criterionId);
    } catch (error) {
      console.error('Error updating subcriterion state:', error);
    } finally {
      setToggleLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(toggleKey);
        return newSet;
      });
    }
  };

  const handleSubCriterionClick = (criterion: Criterion, subCriterion: SubCriterion) => {
    onSubCriterionSelect?.(criterion, subCriterion);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading criteria...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Criteria Structure</h3>
      </div>
      
      <div className={styles.content}>
        {criteria.length === 0 ? (
          <div className={styles.empty}>
            <p>No criteria available</p>
          </div>
        ) : (
          <div className={styles.criteriaList}>
            {criteria.map((criterion) => {
              const isExpanded = expandedCriteria.has(criterion.id);
              const isLoadingSubCriteria = loadingSubCriteria.has(criterion.id);
              const criterionSubCriteria = subCriteria[criterion.id] || [];
              const toggleKey = `criterion-${criterion.id}`;
              const isToggling = toggleLoading.has(toggleKey);

              return (
                <div key={criterion.id} className={styles.criterionItem}>
                  {/* Criterion Header */}
                  <div className={`${styles.criterionHeader} ${styles[criterion.state]}`}>
                    {/* Clickable area for expansion */}
                    <div
                      className={styles.criterionClickArea}
                      onClick={() => toggleCriterionExpansion(criterion)}
                    >
                      <div className={styles.criterionContent}>
                        <div className={styles.criterionInfo}>
                          <span className={styles.criterionName}>{criterion.name}</span>
                          <span className={`${styles.status} ${styles[criterion.state]}`}>
                            {criterion.state}
                          </span>
                        </div>
                        
                        {criterion.description && (
                          <p className={styles.criterionDescription}>{criterion.description}</p>
                        )}
                        
                        <div className={styles.expandIcon}>
                          <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 16 16" 
                            style={{ 
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease'
                            }}
                          >
                            <path
                              d="M6 12L10 8L6 4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Toggle switch - separate from clickable area */}
                    <div className={styles.criterionActions}>
                      <button
                        type="button"
                        onClick={(e) => toggleCriterionState(criterion, e)}
                        className={`${styles.toggleButton} ${criterion.state === 'active' ? styles.active : styles.inactive}`}
                        disabled={isToggling}
                        title={`${criterion.state === 'active' ? 'Deactivate' : 'Activate'} criterion`}
                      >
                        <div className={styles.toggleSlider}></div>
                      </button>
                    </div>
                  </div>

                  {/* Subcriteria */}
                  {isExpanded && (
                    <div className={styles.subCriteriaContainer}>
                      {isLoadingSubCriteria ? (
                        <div className={styles.loadingSubcriteria}>
                          <div className={styles.loadingSpinner}></div>
                          <span>Loading subcriteria...</span>
                        </div>
                      ) : criterionSubCriteria.length === 0 ? (
                        <div className={styles.emptySubcriteria}>
                          <p>No subcriteria available</p>
                        </div>
                      ) : (
                        <div className={styles.subCriteriaList}>
                          {criterionSubCriteria.map((subCriterion) => {
                            const subToggleKey = `subcriterion-${subCriterion.id}`;
                            const isSubToggling = toggleLoading.has(subToggleKey);

                            return (
                              <div
                                key={subCriterion.id}
                                className={`${styles.subCriterionItem} ${styles[subCriterion.state]}`}
                              >
                                {/* Subcriteria clickable area */}
                                <div
                                  className={styles.subCriterionClickArea}
                                  onClick={() => handleSubCriterionClick(criterion, subCriterion)}
                                >
                                  <div className={styles.subCriterionContent}>
                                    <div className={styles.subCriterionInfo}>
                                      <span className={styles.subCriterionName}>{subCriterion.name}</span>
                                      <span className={`${styles.status} ${styles[subCriterion.state]} ${styles.small}`}>
                                        {subCriterion.state}
                                      </span>
                                    </div>
                                    {subCriterion.description && (
                                      <p className={styles.subCriterionDescription}>{subCriterion.description}</p>
                                    )}
                                  </div>
                                </div>

                                {/* Subcriteria toggle switch */}
                                <div className={styles.subCriterionActions}>
                                  <button
                                    type="button"
                                    onClick={(e) => toggleSubCriterionState(subCriterion, e)}
                                    className={`${styles.toggleButton} ${subCriterion.state === 'active' ? styles.active : styles.inactive}`}
                                    disabled={isSubToggling}
                                    title={`${subCriterion.state === 'active' ? 'Deactivate' : 'Activate'} subcriterion`}
                                  >
                                    <div className={styles.toggleSlider}></div>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}