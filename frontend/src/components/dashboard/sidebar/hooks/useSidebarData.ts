import { useState, useEffect } from 'react';
import type { Project, Evaluation } from '../types';

interface UseSidebarDataReturn {
  recentProjects: Project[];
  recentEvaluations: Evaluation[];
  loadingProjects: boolean;
  loadingEvaluations: boolean;
  error: string | null;
}

export function useSidebarData(): UseSidebarDataReturn {
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentEvaluations, setRecentEvaluations] = useState<Evaluation[]>([]);
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
        // Filtrar solo proyectos completados (con resultados)
        const sorted = data
          .filter((p: Project) => p.final_project_score !== null)
          .sort((a: Project, b: Project) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )
          .slice(0, 3);
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
          .sort((a: Evaluation, b: Evaluation) => {
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
