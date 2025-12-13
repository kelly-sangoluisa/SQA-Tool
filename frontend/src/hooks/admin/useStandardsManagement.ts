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
      loadStandards().catch(() => {
        // Error already handled in loadStandards
      });
    }
  }, [isAuthenticated, authLoading]);

  const loadStandards = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await parameterizationApi.getStandards({ state: 'all' });
      setStandards(data);
    } catch {
      setError('Error al cargar los estándares');
    } finally {
      setLoading(false);
    }
  };

  const toggleStandardState = async (standard: Standard) => {
    const newState = standard.state === 'active' ? 'inactive' : 'active';
    
    // Actualización optimista: cambiar el estado inmediatamente en la UI
    setStandards(prevStandards => 
      prevStandards.map(s => 
        s.id === standard.id 
          ? { ...s, state: newState }
          : s
      )
    );
    
    try {
      // Hacer la petición al servidor
      await parameterizationApi.updateStandardState(standard.id, { state: newState });
    } catch {
      setError('Error al actualizar el estado del estándar');
      
      // Revertir el cambio si falla la petición
      setStandards(prevStandards => 
        prevStandards.map(s => 
          s.id === standard.id 
            ? { ...s, state: standard.state }
            : s
        )
      );
    }
  };

  const updateStandard = (updatedStandard: Standard) => {
    // Actualización optimista: actualizar el estándar inmediatamente en la UI
    setStandards(prevStandards => 
      prevStandards.map(s => 
        s.id === updatedStandard.id 
          ? updatedStandard
          : s
      )
    );
  };

  const addStandard = (newStandard: Standard) => {
    // Agregar nuevo estándar a la lista
    setStandards(prevStandards => [...prevStandards, newStandard]);
  };

  return {
    standards,
    loading,
    error,
    authLoading,
    isAuthenticated,
    loadStandards,
    toggleStandardState,
    updateStandard,
    addStandard
  };
}
