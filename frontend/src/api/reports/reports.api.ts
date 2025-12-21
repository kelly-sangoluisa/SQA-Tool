import { apiClient } from '../shared/api-client';
import type { 
  EvaluationListItem, 
  EvaluationReport,
  EvaluationStats,
  ProjectSummary,
  ProjectReport,
  ProjectStats
} from './reports.types';

/**
 * API para el módulo de Resultados/Reportes
 * Consume los endpoints del ReportsController
 */

/**
 * Obtiene todos los proyectos del usuario actual
 */
export async function getMyProjects(): Promise<ProjectSummary[]> {
  return await apiClient.get<ProjectSummary[]>('/reports/my-projects');
}

/**
 * Obtiene las evaluaciones de los proyectos del usuario actual
 */
export async function getMyEvaluations(): Promise<EvaluationListItem[]> {
  return await apiClient.get<EvaluationListItem[]>('/reports/my-evaluations');
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
/**
 * Obtiene el reporte completo de un proyecto (con todas sus evaluaciones)
 */
export async function getProjectReport(projectId: number): Promise<ProjectReport> {
  return await apiClient.get<ProjectReport>(`/reports/projects/${projectId}/report`);
}

/**
 * Obtiene las estadísticas de un proyecto
 */
export async function getProjectStats(projectId: number): Promise<ProjectStats> {
  return await apiClient.get<ProjectStats>(`/reports/projects/${projectId}/stats`);
}