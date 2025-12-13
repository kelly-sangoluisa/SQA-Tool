/**
 * API para el módulo de Entry Data
 */

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
    let errorMessage = 'Error al guardar los datos';
    try {
      const error = await response.json();
      errorMessage = error && typeof error.message === 'string' ? error.message : errorMessage;
    } catch {
      // Server didn't return JSON
    }
    throw new Error(errorMessage);
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
    let errorMessage = 'Error al finalizar la evaluación';
    try {
      const error = await response.json();
      errorMessage = error && typeof error.message === 'string' ? error.message : errorMessage;
    } catch {
      // Server didn't return JSON
    }
    throw new Error(errorMessage);
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
    let errorMessage = 'Error al finalizar el proyecto';
    try {
      const error = await response.json();
      errorMessage = error && typeof error.message === 'string' ? error.message : errorMessage;
    } catch {
      // Server didn't return JSON
    }
    throw new Error(errorMessage);
  }
}

/**
 * Obtener resumen completo de evaluación
 */
export async function getEvaluationCompleteResults(evaluationId: number): Promise<CompleteResults> {
  const response = await fetch(`/api/entry-data/evaluations/${evaluationId}/complete-results`);

  if (!response.ok) {
    let errorMessage = 'Error al obtener resultados de evaluación';
    try {
      const error = await response.json();
      errorMessage = error && typeof error.message === 'string' ? error.message : errorMessage;
    } catch {
      // Server didn't return JSON
    }
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch (err) {
    throw new Error('Error al procesar respuesta del servidor');
  }
}

/**
 * Obtener resultados completos del proyecto
 */
export async function getProjectCompleteResults(projectId: number): Promise<CompleteResults> {
  const response = await fetch(`/api/entry-data/projects/${projectId}/complete-results`);

  if (!response.ok) {
    let errorMessage = 'Error al obtener resultados del proyecto';
    try {
      const error = await response.json();
      errorMessage = error && typeof error.message === 'string' ? error.message : errorMessage;
    } catch {
      // Server didn't return JSON
    }
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch (err) {
    throw new Error('Error al procesar respuesta del servidor');
  }
}

interface ProjectProgress {
  total_metrics: number;
  completed_metrics: number;
  percentage: number;
}

/**
 * Obtener progreso del proyecto
 */
export async function getProjectProgress(projectId: number): Promise<ProjectProgress> {
  const response = await fetch(`/api/entry-data/projects/${projectId}/progress`);

  if (!response.ok) {
    let errorMessage = 'Error al obtener progreso del proyecto';
    try {
      const error = await response.json();
      errorMessage = error && typeof error.message === 'string' ? error.message : errorMessage;
    } catch {
      // Server didn't return JSON
    }
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch (err) {
    throw new Error('Error al procesar respuesta del servidor');
  }
}

interface EvaluationStatus {
  status: string;
  completed: boolean;
  metrics_evaluated: number;
}

/**
 * Obtener estado de la evaluación
 */
export async function getEvaluationStatus(evaluationId: number): Promise<EvaluationStatus> {
  const response = await fetch(`/api/entry-data/evaluations/${evaluationId}/status`);

  if (!response.ok) {
    let errorMessage = 'Error al obtener estado de evaluación';
    try {
      const error = await response.json();
      errorMessage = error && typeof error.message === 'string' ? error.message : errorMessage;
    } catch {
      // Server didn't return JSON
    }
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch (err) {
    throw new Error('Error al procesar respuesta del servidor');
  }
}
