import { apiClient } from '../shared/api-client';
import type { 
  EvaluationListItem, 
  EvaluationReport,
  EvaluationStats,
  ProjectSummary
} from './reports.types';

/**
 * API para el módulo de Resultados/Reportes
 * Consume los endpoints del ReportsController
 */

/**
 * Obtiene todos los proyectos del usuario actual
 */
export async function getMyProjects(): Promise<ProjectSummary[]> {
  console.log('🌐 API: Llamando a /reports/my-projects');
  const result = await apiClient.get<ProjectSummary[]>('/reports/my-projects');
  console.log('🌐 API: Respuesta recibida:', result);
  return result;
}

/**
 * Obtiene las evaluaciones de los proyectos del usuario actual
 */
export async function getMyEvaluations(): Promise<EvaluationListItem[]> {
  console.log('🌐 API: Llamando a /reports/my-evaluations');
  const result = await apiClient.get<EvaluationListItem[]>('/reports/my-evaluations');
  console.log('🌐 API: Respuesta recibida:', result);
  return result;
}

/**
 * Obtiene la lista de todas las evaluaciones
 */
export async function getAllEvaluations(): Promise<EvaluationListItem[]> {
  return await apiClient.get<EvaluationListItem[]>('/reports/evaluations');
}

/**
 * Obtiene las evaluaciones de un proyecto específico
 */
export async function getEvaluationsByProject(projectId: number): Promise<EvaluationListItem[]> {
  return await apiClient.get<EvaluationListItem[]>(`/reports/projects/${projectId}/evaluations`);
}

/**
 * Obtiene el reporte completo de una evaluación
 */
export async function getEvaluationReport(evaluationId: number): Promise<EvaluationReport> {
  return await apiClient.get<EvaluationReport>(`/reports/evaluations/${evaluationId}`);
}

/**
 * Obtiene las estadísticas de una evaluación
 */
export async function getEvaluationStats(evaluationId: number): Promise<EvaluationStats> {
  return await apiClient.get<EvaluationStats>(`/reports/evaluations/${evaluationId}/stats`);
}
