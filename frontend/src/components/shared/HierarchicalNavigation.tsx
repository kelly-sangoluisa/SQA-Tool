import React, { useState, useEffect, useCallback } from 'react';
import { Switch } from './Switch';
import styles from './HierarchicalNavigation.module.css';

/**
 * Base interface for criterion-like items
 */
export interface BaseCriterion {
  id: number;
  name: string;
  state: 'active' | 'inactive';
}

/**
 * Base interface for sub-criterion-like items
 */
export interface BaseSubCriterion {
  id: number;
  name: string;
  state: 'active' | 'inactive';
  criterion_id: number;
}

/**
 * Props for the reusable HierarchicalNavigation component
 */
export interface HierarchicalNavigationProps<C extends BaseCriterion, S extends BaseSubCriterion> {
  /** Optional callback when refresh is needed */
  readonly onRefresh?: () => void;
  
  /** Optional parent ID (e.g., standardId, projectId) */
  readonly parentId?: number;
  
  /** Callback when a criterion is selected */
  readonly onCriterionSelect?: (criterion: C) => void;
  
  /** Callback when a sub-criterion is selected */
  readonly onSubCriterionSelect?: (criterion: C, subCriterion: S) => void;
  
  /** Callback when edit button is clicked for a criterion */
  readonly onCriterionEdit?: (criterion: C) => void;
  
  /** Callback when create criterion button is clicked */
  readonly onCriterionCreate?: () => void;
  
  /** Callback when edit button is clicked for a sub-criterion */
  readonly onSubCriterionEdit?: (criterion: C, subCriterion: S) => void;
  
  /** Callback when create sub-criterion button is clicked */
  readonly onSubCriterionCreate?: (criterion: C) => void;
  
  /** Callback when a sub-criterion state changes */
  readonly onSubCriterionStateChange?: (subCriterion: S) => void;
  
  /** Callback when a criterion state changes */
  readonly onCriterionStateChange?: (criterion: C) => void;
  
  /** List of criteria to display */
  readonly criteria: C[];
  
  /** Loading state for criteria */
  readonly loading?: boolean;
  
  /** Function to load sub-criteria for a given criterion */
  readonly loadSubCriteria: (criterionId: number, forceRefresh?: boolean) => Promise<S[]>;
  
  /** Function to update criterion state */
  readonly updateCriterionState: (criterionId: number, state: 'active' | 'inactive') => Promise<void>;
  
  /** Function to update sub-criterion state */
  readonly updateSubCriterionState: (subCriterionId: number, state: 'active' | 'inactive') => Promise<void>;
  
  /** Header title */
  readonly headerTitle?: string;
  
  /** Create button label */
  readonly createButtonLabel?: string;
  
  /** Whether to show the create button */
  readonly showCreateButton?: boolean;
  
  /** Whether to allow editing */
  readonly allowEdit?: boolean;
  
  /** Whether to show state toggles */
  readonly showStateToggles?: boolean;
  
  /** Empty state message */
  readonly emptyMessage?: string;
  
  /** Empty sub-criteria message */
  readonly emptySubCriteriaMessage?: string;
  
  /** Sub-criteria list title */
  readonly subCriteriaTitle?: string;
  
  /** Callback to get a function that can refresh sub-criteria for a specific criterion */
  readonly onRefreshSubCriteriaRef?: (refreshFn: (criterionId: number) => Promise<void>) => void;
}

/**
 * Reusable HierarchicalNavigation component
 * 
 * A flexible navigation component for displaying hierarchical items and sub-items.
 * Can be used in different contexts (parameterization, data-entry, reports, etc.)
 * Works with any data that follows the BaseCriterion and BaseSubCriterion structure.
 */
export function HierarchicalNavigation<C extends BaseCriterion, S extends BaseSubCriterion>({
  onRefresh,
  parentId,
  onCriterionSelect,
  onSubCriterionSelect,
  onCriterionEdit,
  onCriterionCreate,
  onSubCriterionEdit,
  onSubCriterionCreate,
  onSubCriterionStateChange,
  onCriterionStateChange,
  criteria,
  loading = false,
  loadSubCriteria,
  updateCriterionState,
  updateSubCriterionState,
  headerTitle = 'Estructura de Criterios',
  createButtonLabel = 'Nuevo Criterio',
  showCreateButton = true,
  allowEdit = true,
  showStateToggles = true,
  emptyMessage = 'No hay criterios disponibles',
  emptySubCriteriaMessage = 'No hay subcriterios disponibles',
  subCriteriaTitle = 'Subcriterios',
  onRefreshSubCriteriaRef
}: HierarchicalNavigationProps<C, S>) {
  const [subCriteria, setSubCriteria] = useState<Record<number, S[]>>({});
  const [expandedCriteria, setExpandedCriteria] = useState<Set<number>>(new Set());
  const [loadingSubCriteria, setLoadingSubCriteria] = useState<Set<number>>(new Set());
  const [toggleLoading, setToggleLoading] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (parentId !== undefined) {
      // Limpiar subcriterios cuando se cambie de padre
      setSubCriteria({});
      setExpandedCriteria(new Set());
    }
  }, [parentId]);
  
  const loadSubCriteriaForCriterion = useCallback(async (criterionId: number, forceRefresh: boolean = false) => {
    setLoadingSubCriteria(prev => {
      // Solo proceder si no está cargando ya o es un force refresh
      if (prev.has(criterionId) && !forceRefresh) return prev;
      return new Set([...prev, criterionId]);
    });

    try {
      const subCriteriaData = await loadSubCriteria(criterionId, forceRefresh);
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
  }, [loadSubCriteria]);
  
  // Expose refresh function to parent
  useEffect(() => {
    if (onRefreshSubCriteriaRef) {
      onRefreshSubCriteriaRef(loadSubCriteriaForCriterion);
    }
  }, [onRefreshSubCriteriaRef, loadSubCriteriaForCriterion]);

  const toggleCriterionExpansion = async (criterion: C) => {
    const isExpanded = expandedCriteria.has(criterion.id);
    const newExpanded = new Set(expandedCriteria);

    if (isExpanded) {
      newExpanded.delete(criterion.id);
    } else {
      newExpanded.add(criterion.id);
      await loadSubCriteriaForCriterion(criterion.id);
    }

    setExpandedCriteria(newExpanded);
    onCriterionSelect?.(criterion);
  };

  const toggleCriterionState = async (criterion: C, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const toggleKey = `criterion-${criterion.id}`;
    
    if (toggleLoading.has(toggleKey)) return;

    const newState = criterion.state === 'active' ? 'inactive' : 'active';
    
    // Cambio optimista: Si el criterio se pone inactivo, actualizar todos sus subcriterios visualmente
    if (newState === 'inactive') {
      setSubCriteria(prev => {
        const updated = { ...prev };
        if (updated[criterion.id]) {
          updated[criterion.id] = updated[criterion.id].map(sc => ({ ...sc, state: 'inactive' as const }));
        }
        return updated;
      });
    }

    setToggleLoading(prev => new Set([...prev, toggleKey]));
    try {
      await updateCriterionState(criterion.id, newState);
      
      // Notificar al padre sobre el cambio de estado
      const updatedCriterion = { ...criterion, state: newState };
      onCriterionStateChange?.(updatedCriterion);
      
      // Si se activa el criterio, recargar subcriterios para obtener estados reales
      if (newState === 'active') {
        await loadSubCriteriaForCriterion(criterion.id, true);
      }
      
      onRefresh?.();
    } catch (error) {
      console.error('Error updating criterion state:', error);
      
      // Revertir el cambio si falla
      if (newState === 'inactive') {
        await loadSubCriteriaForCriterion(criterion.id, true);
      }
    } finally {
      setToggleLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(toggleKey);
        return newSet;
      });
    }
  };

  const toggleSubCriterionState = async (subCriterion: S, e: React.MouseEvent) => {
    e.stopPropagation();
    const toggleKey = `subcriterion-${subCriterion.id}`;
    
    if (toggleLoading.has(toggleKey)) return;

    // Encontrar el criterio padre
    const parentCriterion = criteria.find(c => c.id === subCriterion.criterion_id);
    
    // Si el criterio padre está inactivo, no permitir activar subcriterios
    if (parentCriterion && parentCriterion.state === 'inactive' && subCriterion.state === 'inactive') {
      console.warn('No se puede activar un subcriterio cuando el criterio padre está inactivo');
      return;
    }

    const newState = subCriterion.state === 'active' ? 'inactive' : 'active';
    const criterionId = subCriterion.criterion_id;
    
    // Cambio optimista: actualizar UI inmediatamente
    setSubCriteria(prev => {
      const updated = { ...prev };
      if (updated[criterionId]) {
        updated[criterionId] = updated[criterionId].map(sc => 
          sc.id === subCriterion.id 
            ? { ...sc, state: newState }
            : sc
        );
      }
      return updated;
    });

    setToggleLoading(prev => new Set([...prev, toggleKey]));
    try {
      await updateSubCriterionState(subCriterion.id, newState);
      
      // Notificar al padre sobre el cambio de estado
      const updatedSubCriterion = { ...subCriterion, state: newState };
      onSubCriterionStateChange?.(updatedSubCriterion);
    } catch (error) {
      console.error('Error updating subcriterion state:', error);
      
      // Revertir el cambio si falla
      setSubCriteria(prev => {
        const updated = { ...prev };
        if (updated[criterionId]) {
          updated[criterionId] = updated[criterionId].map(sc => 
            sc.id === subCriterion.id 
              ? { ...sc, state: subCriterion.state }
              : sc
          );
        }
        return updated;
      });
    } finally {
      setToggleLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(toggleKey);
        return newSet;
      });
    }
  };

  const handleSubCriterionClick = (criterion: C, subCriterion: S) => {
    onSubCriterionSelect?.(criterion, subCriterion);
  };

  const handleEditCriterion = (criterion: C, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCriterionEdit?.(criterion);
  };

  const handleEditSubCriterion = (criterion: C, subCriterion: S, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSubCriterionEdit?.(criterion, subCriterion);
  };

  const handleCreateSubCriterion = (criterion: C, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSubCriterionCreate?.(criterion);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando criterios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>{headerTitle}</h3>
        {showCreateButton && parentId !== undefined && (
          <button
            type="button"
            onClick={() => onCriterionCreate?.()}
            className={styles.createButton}
            title={createButtonLabel}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1V15M1 8H15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {createButtonLabel}
          </button>
        )}
      </div>
      
      <div className={styles.content}>
        {criteria.length === 0 ? (
          <div className={styles.empty}>
            <p>{emptyMessage}</p>
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
                    {/* Expand/Collapse Icon */}
                    <button
                      className={styles.expandButton}
                      onClick={() => toggleCriterionExpansion(criterion)}
                      title={isExpanded ? 'Contraer' : 'Expandir'}
                    >
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
                    </button>

                    {/* Criterion Name - Clickable */}
                    <div
                      className={styles.criterionClickArea}
                      onClick={() => onCriterionSelect?.(criterion)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onCriterionSelect?.(criterion);
                        }
                      }}
                    >
                      <span className={styles.criterionName}>{criterion.name}</span>
                    </div>

                    {/* Edit Button */}
                    {allowEdit && (
                      <button
                        type="button"
                        onClick={(e) => handleEditCriterion(criterion, e)}
                        className={styles.editButton}
                        title="Editar criterio"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="m18.5 2.5 A2.121 2.121 0 0 1 21 4.5L20 5.5l-3 3L12 13.5 9 12.5 10.5 9.5 18.5 2.5z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Toggle Switch */}
                    {showStateToggles && (
                      <Switch
                        checked={criterion.state === 'active'}
                        onChange={(checked) => {
                          const e = { stopPropagation: () => {}, preventDefault: () => {} } as React.MouseEvent;
                          toggleCriterionState(criterion, e);
                        }}
                        disabled={isToggling}
                        title={`${criterion.state === 'active' ? 'Desactivar' : 'Activar'} criterio`}
                      />
                    )}
                  </div>

                  {/* Subcriteria */}
                  {isExpanded && (
                    <div className={styles.subCriteriaContainer}>
                      {isLoadingSubCriteria ? (
                        <div className={styles.loadingSubcriteria}>
                          <div className={styles.loadingSpinner}></div>
                          <span>Cargando subcriterios...</span>
                        </div>
                      ) : (
                        criterionSubCriteria.length === 0 ? (
                          <div className={styles.emptySubCriteria}>
                            <p>{emptySubCriteriaMessage}</p>
                            {allowEdit && (
                              <button
                                type="button"
                                onClick={(e) => handleCreateSubCriterion(criterion, e)}
                                className={styles.createSubButton}
                              >
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                  <path
                                    d="M8 1V15M1 8H15"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                </svg>
                                Agregar Subcriterio
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className={styles.subCriteriaListContainer}>
                            <div className={styles.subCriteriaHeader}>
                              <span className={styles.subCriteriaTitle}>
                                {subCriteriaTitle} ({criterionSubCriteria.length})
                              </span>
                              {allowEdit && (
                                <button
                                  type="button"
                                  onClick={(e) => handleCreateSubCriterion(criterion, e)}
                                  className={styles.createSubButtonSmall}
                                  title="Agregar subcriterio"
                                >
                                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                    <path
                                      d="M8 1V15M1 8H15"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                </button>
                              )}
                            </div>
                            <div className={styles.subCriteriaList}>
                              {criterionSubCriteria.map((subCriterion) => {
                                const subToggleKey = `subcriterion-${subCriterion.id}`;
                                const isSubToggling = toggleLoading.has(subToggleKey);

                                return (
                                  <div
                                    key={subCriterion.id}
                                    className={`${styles.subCriterionItem} ${styles[subCriterion.state]}`}
                                  >
                                    {/* Subcriteria icon placeholder */}
                                    <div className={styles.subCriterionIcon}>
                                      <div className={styles.subCriterionDot}></div>
                                    </div>

                                    {/* Subcriteria name - clickable */}
                                    <div
                                      className={styles.subCriterionClickArea}
                                      onClick={() => handleSubCriterionClick(criterion, subCriterion)}
                                      role="button"
                                      tabIndex={0}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                          e.preventDefault();
                                          handleSubCriterionClick(criterion, subCriterion);
                                        }
                                      }}
                                    >
                                      <span className={styles.subCriterionName}>{subCriterion.name}</span>
                                    </div>

                                    {/* Edit SubCriterion Button */}
                                    {allowEdit && (
                                      <button
                                        type="button"
                                        onClick={(e) => handleEditSubCriterion(criterion, subCriterion, e)}
                                        className={styles.editSubButton}
                                        title="Editar subcriterio"
                                      >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                          <path
                                            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                          <path
                                            d="m18.5 2.5 A2.121 2.121 0 0 1 21 4.5L20 5.5l-3 3L12 13.5 9 12.5 10.5 9.5 18.5 2.5z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      </button>
                                    )}

                                    {/* Subcriteria toggle switch */}
                                    {showStateToggles && (
                                      <Switch
                                        checked={subCriterion.state === 'active'}
                                        onChange={(checked) => {
                                          const e = { stopPropagation: () => {}, preventDefault: () => {} } as React.MouseEvent;
                                          toggleSubCriterionState(subCriterion, e);
                                        }}
                                        disabled={isSubToggling || (criterion.state === 'inactive' && subCriterion.state === 'inactive')}
                                        title={
                                          (() => {
                                            if (criterion.state === 'inactive' && subCriterion.state === 'inactive') {
                                              return 'No se puede activar cuando el criterio padre está inactivo';
                                            }
                                            return subCriterion.state === 'active' ? 'Desactivar subcriterio' : 'Activar subcriterio';
                                          })()
                                        }
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )
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
