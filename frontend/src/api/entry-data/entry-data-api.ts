/**
 * API para el módulo de Entry Data
 */

interface SubmitDataPayload {
  variables: Array<{
    metric_id: number;
    variable_id: number;
    symbol: string;
    value: string;
  }>;
}

interface CompleteResults {
  evaluation_id: number;
  project_id: number;
  total_metrics: number;
  completed_metrics: number;
  variables: Array<{
    metric_id: number;
    metric_name: string;
    variable_symbol: string;
    variable_value: string;
  }>;
}

/**
 * Enviar datos de evaluación (Botón "Siguiente")
 */
export async function submitEvaluationData(
  evaluationId: number,
  variables: Array<{ metric_id: number; variable_id: number; symbol: string; value: string }>
): Promise<void> {
  const response = await fetch(`/api/entry-data/evaluations/${evaluationId}/submit-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ variables }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al guardar los datos');
  }
}

/**
 * Finalizar evaluación individual (Botón "Terminar Evaluación")
 */
export async function finalizeEvaluation(evaluationId: number): Promise<void> {
  const response = await fetch(`/api/entry-data/evaluations/${evaluationId}/finalize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al finalizar la evaluación');
  }
}

/**
 * Finalizar proyecto completo (Automático última evaluación)
 */
export async function finalizeProject(projectId: number): Promise<void> {
  const response = await fetch(`/api/entry-data/projects/${projectId}/finalize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al finalizar el proyecto');
  }
}

/**
 * Obtener resumen completo de evaluación
 */
export async function getEvaluationCompleteResults(evaluationId: number): Promise<CompleteResults> {
  const response = await fetch(`/api/entry-data/evaluations/${evaluationId}/complete-results`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al obtener resultados de evaluación');
  }

  return response.json();
}

/**
 * Obtener resultados completos del proyecto
 */
export async function getProjectCompleteResults(projectId: number): Promise<any> {
  const response = await fetch(`/api/entry-data/projects/${projectId}/complete-results`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al obtener resultados del proyecto');
  }

  return response.json();
}

/**
 * Obtener progreso del proyecto
 */
export async function getProjectProgress(projectId: number): Promise<any> {
  const response = await fetch(`/api/entry-data/projects/${projectId}/progress`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al obtener progreso del proyecto');
  }

  return response.json();
}

/**
 * Obtener estado de la evaluación
 */
export async function getEvaluationStatus(evaluationId: number): Promise<any> {
  const response = await fetch(`/api/entry-data/evaluations/${evaluationId}/status`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al obtener estado de evaluación');
  }

  return response.json();
}
