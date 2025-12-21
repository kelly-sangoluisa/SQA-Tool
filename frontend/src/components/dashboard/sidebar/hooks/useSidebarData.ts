import { useState, useEffect } from 'react';
import type { DashboardProject, DashboardEvaluation } from '../types';

interface UseSidebarDataReturn {
  recentProjects: DashboardProject[];
  recentEvaluations: DashboardEvaluation[];
  loadingProjects: boolean;
  loadingEvaluations: boolean;
  error: string | null;
}

export function useSidebarData(): UseSidebarDataReturn {
  const [recentProjects, setRecentProjects] = useState<DashboardProject[]>([]);
  const [recentEvaluations, setRecentEvaluations] = useState<DashboardEvaluation[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingEvaluations, setLoadingEvaluations] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecentProjects().catch(err => console.error('Failed to load projects:', err));
    loadRecentEvaluations().catch(err => console.error('Failed to load evaluations:', err));
  }, []);

  const loadRecentProjects = async () => {
    try {
      const response = await fetch('/api/reports/my-projects');
      if (response.ok) {
        const data = await response.json();
        // Ordenar por fecha de actualización y tomar los 10 más recientes
        const sorted = data
          .sort((a: DashboardProject, b: DashboardProject) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )
          .slice(0, 10);
        setRecentProjects(sorted);
      }
    } catch (err) {
      setError('Error al cargar proyectos');
      console.error('Error loading recent projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadRecentEvaluations = async () => {
    try {
      const response = await fetch('/api/reports/my-evaluations');
      if (response.ok) {
        const data = await response.json();
        const sorted = data
          .sort((a: DashboardEvaluation, b: DashboardEvaluation) => {
            const dateA = new Date(a.updated_at || a.created_at).getTime();
            const dateB = new Date(b.updated_at || b.created_at).getTime();
            return dateB - dateA;
          })
          .slice(0, 3);
        setRecentEvaluations(sorted);
      }
    } catch (err) {
      setError('Error al cargar evaluaciones');
      console.error('Error loading recent evaluations:', err);
    } finally {
      setLoadingEvaluations(false);
    }
  };

  return {
    recentProjects,
    recentEvaluations,
    loadingProjects,
    loadingEvaluations,
    error,
  };
}
