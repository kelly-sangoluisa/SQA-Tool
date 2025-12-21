import { apiClient } from '../shared/api-client';
import type { AIAnalysisResponse } from './ai-analysis.types';

export async function generateAIAnalysis(projectId: number): Promise<AIAnalysisResponse> {
  return apiClient.post<AIAnalysisResponse>(
    `/reports/projects/${projectId}/ai-analysis`
  );
}
