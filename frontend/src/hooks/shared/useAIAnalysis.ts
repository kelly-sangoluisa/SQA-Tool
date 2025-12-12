import { useState } from 'react';
import { generateAIAnalysis } from '@/api/reports/ai-analysis.api';
import type { AIAnalysisResponse } from '@/api/reports/ai-analysis.types';

export function useAIAnalysis() {
  const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeProject = async (projectId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await generateAIAnalysis(projectId);
      setAnalysis(result);
      
      return result;
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = error.response?.data?.message || 
                          error.message ||
                          'Error al generar análisis con IA. Por favor intenta de nuevo.';
      setError(errorMessage);
      console.error('Error generating AI analysis:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysis(null);
    setError(null);
  };

  return {
    analysis,
    loading,
    error,
    analyzeProject,
    clearAnalysis,
  };
}
