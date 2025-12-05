import { useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import { parameterizationApi, Standard } from '../../api/parameterization/parameterization-api';

export function useStandardsManagement() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadStandards();
    }
  }, [isAuthenticated, authLoading]);

  const loadStandards = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await parameterizationApi.getStandards({ state: 'all' });
      setStandards(data);
    } catch (error) {
      console.error('Error loading standards:', error);
      setError('Error al cargar los estándares');
    } finally {
      setLoading(false);
    }
  };

  const toggleStandardState = async (standard: Standard) => {
    try {
      const newState = standard.state === 'active' ? 'inactive' : 'active';
      await parameterizationApi.updateStandardState(standard.id, { state: newState });
      await loadStandards();
    } catch (error) {
      console.error('Error updating standard state:', error);
      setError('Error al actualizar el estado del estándar');
    }
  };

  return {
    standards,
    loading,
    error,
    authLoading,
    isAuthenticated,
    loadStandards,
    toggleStandardState
  };
}
