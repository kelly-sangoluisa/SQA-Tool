import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Criterion, 
  SubCriterion, 
  parameterizationApi
} from '../../api/parameterization/parameterization-api';
import { useCriteriaManagement } from '../../hooks/admin/useCriteriaManagement';
import { CriterionFormDrawer } from './CriterionFormDrawer';
import { SubCriterionFormDrawer } from './SubCriterionFormDrawer';
import { 
  HierarchicalNavigation
} from '../shared/hierarchy/HierarchicalNavigation';

interface CriteriaNavigationProps {
  readonly onRefresh?: () => void;
  readonly standardId?: number;
  readonly onCriterionSelect?: (criterion: Criterion) => void;
  readonly onSubCriterionSelect?: (criterion: Criterion, subCriterion: SubCriterion) => void;
  readonly onCriterionEdit?: (criterion: Criterion) => void;
  readonly onCriterionCreate?: () => void;
  readonly onSubCriterionEdit?: (criterion: Criterion, subCriterion: SubCriterion) => void;
  readonly onSubCriterionCreate?: (criterion: Criterion) => void;
  readonly onSubCriterionStateChange?: (subCriterion: SubCriterion) => void;
  readonly onCriterionStateChange?: (criterion: Criterion) => void;
}

/**
 * CriteriaNavigation for Parameterization module
 * 
 * This is a wrapper around the shared HierarchicalNavigation component
 * that provides parameterization-specific logic and form handling.
 */
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
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null);
  const [isSubFormOpen, setIsSubFormOpen] = useState(false);
  const [editingSubCriterion, setEditingSubCriterion] = useState<SubCriterion | null>(null);
  const [parentCriterion, setParentCriterion] = useState<Criterion | null>(null);
  const refreshSubCriteriaFnRef = useRef<((criterionId: number) => Promise<void>) | null>(null);

  useEffect(() => {
    if (standardId) {
      loadCriteria();
    }
  }, [standardId, loadCriteria]);

  // Function to load sub-criteria
  const loadSubCriteria = async (criterionId: number, forceRefresh?: boolean): Promise<SubCriterion[]> => {
    try {
      const subCriteriaData = await parameterizationApi.getSubCriteriaByCriterion(criterionId, { state: 'all' });
      return subCriteriaData;
    } catch (error) {
      console.error('Error loading subcriteria:', error);
      return [];
    }
  };

  // Function to update criterion state
  const updateCriterionState = async (criterionId: number, state: 'active' | 'inactive'): Promise<void> => {
    try {
      await parameterizationApi.updateCriterionState(criterionId, { state });
      await loadCriteria();
    } catch (error) {
      console.error('Error updating criterion state:', error);
      throw error instanceof Error ? error : new Error('Error updating criterion state');
    }
  };

  // Function to update sub-criterion state
  const updateSubCriterionState = async (subCriterionId: number, state: 'active' | 'inactive'): Promise<void> => {
    try {
      await parameterizationApi.updateSubCriterionState(subCriterionId, { state });
    } catch (error) {
      console.error('Error updating subcriterion state:', error);
      throw error;
    }
  };

  // Handler for criterion edit
  const handleEditCriterion = (criterion: Criterion) => {
    setEditingCriterion(criterion);
    setIsFormOpen(true);
    onCriterionEdit?.(criterion);
  };

  // Handler for criterion create
  const handleCreateCriterion = () => {
    setEditingCriterion(null);
    setIsFormOpen(true);
    onCriterionCreate?.();
  };

  // Handler for sub-criterion edit
  const handleEditSubCriterion = (criterion: Criterion, subCriterion: SubCriterion) => {
    setEditingSubCriterion(subCriterion);
    setParentCriterion(criterion);
    setIsSubFormOpen(true);
    onSubCriterionEdit?.(criterion, subCriterion);
  };

  // Handler for sub-criterion create
  const handleCreateSubCriterion = (criterion: Criterion) => {
    setEditingSubCriterion(null);
    setParentCriterion(criterion);
    setIsSubFormOpen(true);
    onSubCriterionCreate?.(criterion);
  };

  // Handler for form close
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCriterion(null);
  };

  // Handler for sub-form close
  const handleCloseSubForm = () => {
    setIsSubFormOpen(false);
    setEditingSubCriterion(null);
    setParentCriterion(null);
  };

  // Handler for criterion saved
  const handleCriterionSaved = async (savedCriterion?: Criterion) => {
    if (savedCriterion) {
      if (editingCriterion) {
        updateCriterion(savedCriterion);
      } else {
        addCriterion(savedCriterion);
      }
      // Force immediate reload to ensure the UI is synchronized
      await loadCriteria();
    } else {
      await loadCriteria();
    }
    handleCloseForm();
    onRefresh?.();
  };

  // Handler for sub-criterion saved
  const handleSubCriterionSaved = async (savedSubCriterion?: SubCriterion) => {
    // Refresh sub-criteria for the parent criterion with forceRefresh=true
    if (parentCriterion && refreshSubCriteriaFnRef.current) {
      // Force refresh to ensure the new sub-criterion appears immediately
      await refreshSubCriteriaFnRef.current(parentCriterion.id);
    }
    handleCloseSubForm();
    onRefresh?.();
  };

  // Callback to receive the refresh function from HierarchicalNavigation
  const handleRefreshSubCriteriaRef = useCallback((fn: (criterionId: number) => Promise<void>) => {
    refreshSubCriteriaFnRef.current = fn;
  }, []);

  return (
    <>
      <HierarchicalNavigation<Criterion, SubCriterion>
        criteria={criteria}
        loading={loading}
        parentId={standardId}
        loadSubCriteria={loadSubCriteria}
        updateCriterionState={updateCriterionState}
        updateSubCriterionState={updateSubCriterionState}
        onCriterionSelect={onCriterionSelect}
        onSubCriterionSelect={onSubCriterionSelect}
        onCriterionEdit={handleEditCriterion}
        onCriterionCreate={handleCreateCriterion}
        onSubCriterionEdit={handleEditSubCriterion}
        onSubCriterionCreate={handleCreateSubCriterion}
        onCriterionStateChange={onCriterionStateChange}
        onSubCriterionStateChange={onSubCriterionStateChange}
        onRefresh={onRefresh}
        onRefreshSubCriteriaRef={handleRefreshSubCriteriaRef}
        headerTitle="Estructura de Criterios"
        createButtonLabel="Nuevo Criterio"
        showCreateButton={true}
        allowEdit={true}
        showStateToggles={true}
        emptyMessage="No hay criterios disponibles"
        emptySubCriteriaMessage="No hay subcriterios disponibles"
        subCriteriaTitle="Subcriterios"
      />
      
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
    </>
  );
}
