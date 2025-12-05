import { useState, useCallback } from 'react';
import { Criterion, parameterizationApi, CreateCriterionDto, UpdateCriterionDto } from '../../api/parameterization/parameterization-api';

export function useCriteriaManagement(standardId?: number) {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCriteria = useCallback(async () => {
    if (!standardId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await parameterizationApi.getCriteriaByStandard(standardId, { state: 'all' });
      setCriteria(data);
    } catch (error) {
      console.error('Error loading criteria:', error);
      setError('Error al cargar los criterios');
    } finally {
      setLoading(false);
    }
  }, [standardId]);

  const toggleCriterionState = async (criterion: Criterion) => {
    // Actualización optimista: cambiar el estado inmediatamente en la UI
    const newState = criterion.state === 'active' ? 'inactive' : 'active';
    setCriteria(prevCriteria => 
      prevCriteria.map(c => 
        c.id === criterion.id 
          ? { ...c, state: newState } 
          : c
      )
    );

    try {
      await parameterizationApi.updateCriterionState(criterion.id, { state: newState });
    } catch (error) {
      console.error('Error updating criterion state:', error);
      
      // Revertir en caso de error
      setCriteria(prevCriteria => 
        prevCriteria.map(c => 
          c.id === criterion.id 
            ? { ...c, state: criterion.state } 
            : c
        )
      );
      
      setError('Error al actualizar el estado del criterio');
    }
  };

  const updateCriterion = (updatedCriterion: Criterion) => {
    // Actualización optimista: actualizar el criterio inmediatamente en la UI
    setCriteria(prevCriteria => 
      prevCriteria.map(c => 
        c.id === updatedCriterion.id 
          ? updatedCriterion
          : c
      )
    );
  };

  const addCriterion = (newCriterion: Criterion) => {
    // Agregar nuevo criterio a la lista
    setCriteria(prevCriteria => [...prevCriteria, newCriterion]);
  };

  return {
    criteria,
    setCriteria,
    loading,
    error,
    loadCriteria,
    toggleCriterionState,
    updateCriterion,
    addCriterion
  };
}