import React, { useState, useEffect } from 'react';
import { 
  Criterion, 
  SubCriterion, 
  parameterizationApi
} from '../../api/parameterization/parameterization-api';
import { useCriteriaManagement } from '../../hooks/admin/useCriteriaManagement';
import { CriterionFormDrawer } from './CriterionFormDrawer';
import { SubCriterionFormDrawer } from './SubCriterionFormDrawer';
import styles from './CriteriaNavigation.module.css';

interface CriteriaNavigationProps {
  onRefresh?: () => void;
  standardId?: number;
  onCriterionSelect?: (criterion: Criterion) => void;
  onSubCriterionSelect?: (criterion: Criterion, subCriterion: SubCriterion) => void;
  onCriterionEdit?: (criterion: Criterion) => void;
  onCriterionCreate?: () => void;
  onSubCriterionEdit?: (criterion: Criterion, subCriterion: SubCriterion) => void;
  onSubCriterionCreate?: (criterion: Criterion) => void;
  onSubCriterionStateChange?: (subCriterion: SubCriterion) => void;
  onCriterionStateChange?: (criterion: Criterion) => void;
}

export function CriteriaNavigation({
  onRefresh,
  standardId,
  onCriterionSelect,
  onSubCriterionSelect,
  onCriterionEdit,
  onCriterionCreate,
  onSubCriterionEdit,
  onSubCriterionCreate,
  onSubCriterionStateChange,
  onCriterionStateChange
}: CriteriaNavigationProps) {
  const {
    criteria,
    loading,
    loadCriteria,
    updateCriterion,
    addCriterion
  } = useCriteriaManagement(standardId);
  
  const [subCriteria, setSubCriteria] = useState<Record<number, SubCriterion[]>>({});
  const [expandedCriteria, setExpandedCriteria] = useState<Set<number>>(new Set());
  const [loadingSubCriteria, setLoadingSubCriteria] = useState<Set<number>>(new Set());
  const [toggleLoading, setToggleLoading] = useState<Set<string>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null);
  const [isSubFormOpen, setIsSubFormOpen] = useState(false);
  const [editingSubCriterion, setEditingSubCriterion] = useState<SubCriterion | null>(null);
  const [parentCriterion, setParentCriterion] = useState<Criterion | null>(null);

  useEffect(() => {
    if (standardId) {
      loadCriteria();
      // Limpiar subcriterios cuando se cambie de estándar
      setSubCriteria({});
      setExpandedCriteria(new Set());
    }
  }, [standardId, loadCriteria]);

  const loadSubCriteria = async (criterionId: number, forceRefresh: boolean = false) => {
    if (subCriteria[criterionId] && !forceRefresh) return;

    setLoadingSubCriteria(prev => new Set([...prev, criterionId]));
    try {
      // Usar la función específica para obtener subcriterios con estado 'all'
      const subCriteriaData = await parameterizationApi.getSubCriteriaByCriterion(criterionId, { state: 'all' });
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
    e.preventDefault();
    e.stopPropagation();
    const toggleKey = `criterion-${criterion.id}`;
    
    if (toggleLoading.has(toggleKey)) return;

    const newState = criterion.state === 'active' ? 'inactive' : 'active';
    
    // Cambio optimista: actualizar UI inmediatamente
    const updatedCriterion: Criterion = { ...criterion, state: newState as 'active' | 'inactive' };
    
    // Si el criterio se pone inactivo, actualizar todos sus subcriterios visualmente
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
      await parameterizationApi.updateCriterionState(criterion.id, { state: newState });
      
      // Notificar al padre sobre el cambio de estado
      onCriterionStateChange?.(updatedCriterion);
      
      // Recargar criterios para mantener consistencia
      await loadCriteria();
      
      // Si se activa el criterio, recargar subcriterios para obtener estados reales
      if (newState === 'active') {
        await loadSubCriteria(criterion.id, true);
      }
    } catch (error) {
      console.error('Error updating criterion state:', error);
      
      // Revertir el cambio si falla
      if (newState === 'inactive') {
        await loadSubCriteria(criterion.id, true);
      }
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
      await parameterizationApi.updateSubCriterionState(subCriterion.id, { state: newState });
      
      // Notificar al padre sobre el cambio de estado
      const updatedSubCriterion: SubCriterion = { ...subCriterion, state: newState as 'active' | 'inactive' };
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

  const handleSubCriterionClick = (criterion: Criterion, subCriterion: SubCriterion) => {
    onSubCriterionSelect?.(criterion, subCriterion);
  };

  const handleEditCriterion = (criterion: Criterion, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingCriterion(criterion);
    setIsFormOpen(true);
    onCriterionEdit?.(criterion);
  };

  const handleCreateCriterion = () => {
    setEditingCriterion(null);
    setIsFormOpen(true);
    onCriterionCreate?.();
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCriterion(null);
  };

  const handleCriterionSaved = (savedCriterion?: Criterion) => {
    if (savedCriterion) {
      if (editingCriterion) {
        // Es una actualización
        updateCriterion(savedCriterion);
      } else {
        // Es una creación
        addCriterion(savedCriterion);
      }
    } else {
      // Fallback: recargar toda la lista si no tenemos el criterio
      loadCriteria();
    }
    // Limpiar cache de subcriterios para este criterio
    if (savedCriterion) {
      setSubCriteria(prev => {
        const updated = { ...prev };
        delete updated[savedCriterion.id];
        return updated;
      });
    }
    handleCloseForm();
    onRefresh?.();
  };

  const handleEditSubCriterion = (criterion: Criterion, subCriterion: SubCriterion, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSubCriterion(subCriterion);
    setParentCriterion(criterion);
    setIsSubFormOpen(true);
    onSubCriterionEdit?.(criterion, subCriterion);
  };

  const handleCreateSubCriterion = (criterion: Criterion, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSubCriterion(null);
    setParentCriterion(criterion);
    setIsSubFormOpen(true);
    onSubCriterionCreate?.(criterion);
  };

  const handleCloseSubForm = () => {
    setIsSubFormOpen(false);
    setEditingSubCriterion(null);
    setParentCriterion(null);
  };

  const handleSubCriterionSaved = (savedSubCriterion?: SubCriterion) => {
    if (savedSubCriterion && parentCriterion) {
      // Forzar recarga de los subcriterios para asegurar datos actualizados
      loadSubCriteria(parentCriterion.id, true);
    } else {
      // Fallback: recargar subcriterios si no tenemos el subcriterio
      if (parentCriterion) {
        loadSubCriteria(parentCriterion.id, true);
      }
    }
    handleCloseSubForm();
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
        <h3>Estructura de Criterios</h3>
        {standardId && (
          <button
            type="button"
            onClick={handleCreateCriterion}
            className={styles.createButton}
            title="Crear nuevo criterio"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1V15M1 8H15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Nuevo Criterio
          </button>
        )}
      </div>
      
      <div className={styles.content}>
        {criteria.length === 0 ? (
          <div className={styles.empty}>
            <p>No hay criterios disponibles</p>
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
                    >
                      <span className={styles.criterionName}>{criterion.name}</span>
                    </div>

                    {/* Edit Button */}
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

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={(e) => toggleCriterionState(criterion, e)}
                      className={`${styles.toggleButton} ${criterion.state === 'active' ? styles.active : styles.inactive}`}
                      disabled={isToggling}
                      title={`${criterion.state === 'active' ? 'Desactivar' : 'Activar'} criterio`}
                    >
                      <div className={styles.toggleSlider}></div>
                    </button>
                  </div>

                  {/* Subcriteria */}
                  {isExpanded && (
                    <div className={styles.subCriteriaContainer}>
                      {isLoadingSubCriteria ? (
                        <div className={styles.loadingSubcriteria}>
                          <div className={styles.loadingSpinner}></div>
                          <span>Cargando subcriterios...</span>
                        </div>
                      ) : criterionSubCriteria.length === 0 ? (
                        <div className={styles.emptySubCriteria}>
                          <p>No hay subcriterios disponibles</p>
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
                        </div>
                      ) : (
                        <div className={styles.subCriteriaListContainer}>
                          <div className={styles.subCriteriaHeader}>
                            <span className={styles.subCriteriaTitle}>Subcriterios ({criterionSubCriteria.length})</span>
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
                                >
                                  <span className={styles.subCriterionName}>{subCriterion.name}</span>
                                </div>

                                {/* Edit SubCriterion Button */}
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

                                {/* Subcriteria toggle switch */}
                                <button
                                  type="button"
                                  onClick={(e) => toggleSubCriterionState(subCriterion, e)}
                                  className={`${styles.toggleButton} ${subCriterion.state === 'active' ? styles.active : styles.inactive}`}
                                  disabled={isSubToggling || (criterion.state === 'inactive' && subCriterion.state === 'inactive')}
                                  title={
                                    criterion.state === 'inactive' && subCriterion.state === 'inactive'
                                      ? 'No se puede activar cuando el criterio padre está inactivo'
                                      : `${subCriterion.state === 'active' ? 'Desactivar' : 'Activar'} subcriterio`
                                  }
                                >
                                  <div className={styles.toggleSlider}></div>
                                </button>
                              </div>
                            );
                          })}
                          </div>
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
      
      {isFormOpen && (
        <CriterionFormDrawer
          criterion={editingCriterion}
          standardId={standardId}
          onClose={handleCloseForm}
          onSave={handleCriterionSaved}
        />
      )}
      
      {isSubFormOpen && (
        <SubCriterionFormDrawer
          subCriterion={editingSubCriterion}
          criterionId={parentCriterion?.id}
          onClose={handleCloseSubForm}
          onSave={handleSubCriterionSaved}
        />
      )}
    </div>
  );
}