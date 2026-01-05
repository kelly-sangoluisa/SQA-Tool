'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import '@/styles/data-entry/data-entry.css';
import { DataEntryHierarchy } from '@/components/data-entry/DataEntryHierarchy';
import { MetricCard, type PrimaryButtonAction } from '@/components/data-entry/MetricCard';
import type { ToastType } from '@/components/shared/Toast';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { submitEvaluationData, finalizeEvaluation, finalizeProject } from '@/api/entry-data/entry-data-api';
import type {Metric,SubcriterionInput,EvaluationCriterionAPI,EvaluationDataAPI,  Evaluation,Project} from '@/types/data-entry/data-entry.types';

// Lazy load de componentes no críticos (modales, indicadores)
const EvaluationCompleteModal = dynamic(() => import('@/components/data-entry/EvaluationCompleteModal').then(mod => ({ default: mod.EvaluationCompleteModal })), { ssr: false });
const FinalizedEvaluationModal = dynamic(() => import('@/components/data-entry/FinalizedEvaluationModal').then(mod => ({ default: mod.FinalizedEvaluationModal })), { ssr: false });
const NextEvaluationModal = dynamic(() => import('@/components/data-entry/NextEvaluationModal').then(mod => ({ default: mod.NextEvaluationModal })), { ssr: false });
const AlertBanner = dynamic(() => import('@/components/shared/AlertBanner'), { ssr: false });
const Toast = dynamic(() => import('@/components/shared/Toast').then(mod => ({ default: mod.Toast })), { ssr: false });
const SaveIndicator = dynamic(() => import('@/components/shared/SaveIndicator').then(mod => ({ default: mod.SaveIndicator })), { ssr: false });
const ErrorModal = dynamic(() => import('@/components/shared/ErrorModal').then(mod => ({ default: mod.ErrorModal })), { ssr: false });

// ===== HELPER FUNCTIONS =====

async function fetchProjectData(projectId: number): Promise<Project> {
  const projectResponse = await fetch(`/api/config-evaluation/projects/${projectId}`);
  if (!projectResponse.ok) throw new Error('Error al cargar proyecto');
  
  try {
    return await projectResponse.json();
  } catch {
    throw new Error('Respuesta inválida del servidor');
  }
}

async function fetchEvaluationsData(projectId: number): Promise<EvaluationDataAPI[]> {
  const evaluationsResponse = await fetch(`/api/config-evaluation/projects/${projectId}/evaluations`);
  if (!evaluationsResponse.ok) throw new Error('Error al cargar evaluaciones');
  
  try {
    const data = await evaluationsResponse.json();
    return Array.isArray(data) ? data : [];
  } catch {
    throw new Error('Respuesta inválida al cargar evaluaciones');
  }
}

function buildMetricsBySubcriterion(evaluationCriteria: EvaluationCriterionAPI[]): Map<number, Metric[]> {
  const metricsBySubcriterion = new Map<number, Metric[]>();

  evaluationCriteria.forEach((evalCriterion) => {
    (evalCriterion.evaluation_metrics || []).forEach((evalMetric) => {
      const metric = evalMetric.metric;
      if (!metric) return;

      const subCriterionId = metric.sub_criterion_id;
      if (!subCriterionId) return;

      if (!metricsBySubcriterion.has(subCriterionId)) {
        metricsBySubcriterion.set(subCriterionId, []);
      }

      const existingMetrics = metricsBySubcriterion.get(subCriterionId) || [];
      const metricExists = existingMetrics.some(m => m.id === evalMetric.id);

      if (!metricExists) {
        const metricId = evalMetric.id || metric.id || 0;
        metricsBySubcriterion.get(subCriterionId)!.push({
          id: metricId,
          name: metric.name,
          description: metric.description,
          formula: metric.formula,
          code: metric.code,
          desired_threshold: metric.desired_threshold,
          worst_case: metric.worst_case,
          variables: (metric.variables || []).map((v) => ({
            id: v.id,
            metric_id: metricId,
            symbol: v.symbol,
            description: v.description,
            state: v.state
          }))
        });
      }
    });
  });

  return metricsBySubcriterion;
}

function transformSubcriterion(
  subcriterion: SubcriterionInput,
  metricsBySubcriterion: Map<number, Metric[]>
) {
  const finalMetrics = metricsBySubcriterion.get(subcriterion.id) || [];
  
  return {
    id: subcriterion.id,
    name: subcriterion.name,
    description: subcriterion.description,
    criterion_id: subcriterion.criterion_id,
    state: subcriterion.state,
    created_at: subcriterion.created_at,
    updated_at: subcriterion.updated_at,
    metrics: finalMetrics
  };
}

function transformEvaluationCriteria(
  evaluationCriteria: EvaluationCriterionAPI[],
  metricsBySubcriterion: Map<number, Metric[]>
) {
  return evaluationCriteria.map((evalCriterion) => ({
    ...evalCriterion,
    criterion: {
      id: evalCriterion.criterion?.id || 0,
      name: evalCriterion.criterion?.name || 'Unknown',
      description: evalCriterion.criterion?.description,
      subcriteria: (evalCriterion.criterion?.sub_criteria || [])
        .map((sc) => transformSubcriterion(sc, metricsBySubcriterion))
        .filter(subcriterion => subcriterion.metrics.length > 0)
    }
  }));
}

function transformEvaluationData(evaluation: EvaluationDataAPI): Evaluation {
  const metricsBySubcriterion = buildMetricsBySubcriterion(evaluation.evaluation_criteria || []);

  return {
    ...evaluation,
    standard: evaluation.standard || { id: 0, name: 'Unknown', version: '0.0' },
    evaluation_criteria: transformEvaluationCriteria(
      evaluation.evaluation_criteria || [],
      metricsBySubcriterion
    )
  };
}

async function fetchEvaluationStatuses(evaluations: Evaluation[]): Promise<Set<number>> {
  const completedEvals = new Set<number>();
  
  for (const evaluation of evaluations) {
    try {
      const statusResponse = await fetch(`/api/entry-data/evaluations/${evaluation.id}/status`);
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.status === 'completed') {
          completedEvals.add(evaluation.id);
        }
      }
    } catch {
      // Error verificando estado de evaluación
    }
  }
  
  return completedEvals;
}

async function initializeProjectMetrics(
  evaluationsWithMetrics: Evaluation[],
  projectId: number,
  completedEvals: Set<number>
): Promise<{ metrics: Metric[]; initialIndex: number; savedValues: Record<string, string> }> {
  const metrics = buildMetricsList(evaluationsWithMetrics);
  const savedData = localStorage.getItem(`data-entry-project-${projectId}`);
  const savedValues = savedData ? JSON.parse(savedData) : {};
  const initialMetricIndex = findInitialMetricIndex(evaluationsWithMetrics, metrics, completedEvals, savedValues);
  
  return { metrics, initialIndex: initialMetricIndex, savedValues };
}

function buildMetricsList(evaluations: Evaluation[]): Metric[] {
  const metrics: Metric[] = [];
  
  for (const evaluation of evaluations) {
    for (const evalCriterion of evaluation.evaluation_criteria) {
      if (evalCriterion.criterion.subcriteria?.length) {
        for (const subcriterion of evalCriterion.criterion.subcriteria) {
          if (subcriterion.metrics?.length) {
            metrics.push(...subcriterion.metrics);
          }
        }
      }
    }
  }
  
  return metrics;
}

function isMetricFilledCompletely(metric: Metric, savedValues: Record<string, string>): boolean {
  if (!metric.variables?.length) return true;
  
  return metric.variables.every(variable => {
    const key = `metric-${metric.id}-${variable.symbol}`;
    const value = savedValues[key];
    return value && value.trim() !== '';
  });
}

function findFirstMetricInEvaluation(
  evaluation: Evaluation,
  metrics: Metric[],
  savedValues: Record<string, string>
): number {
  for (let i = 0; i < metrics.length; i++) {
    const metric = metrics[i];
    
    if (!metricBelongsToEvaluation(metric, evaluation)) {
      continue;
    }
    
    // Si encontramos una métrica vacía, retornar su índice
    if (!isMetricFilledCompletely(metric, savedValues)) {
      return i;
    }
  }
  
  // Si todas están llenas, retornar la primera de esta evaluación
  for (let i = 0; i < metrics.length; i++) {
    if (metricBelongsToEvaluation(metrics[i], evaluation)) {
      return i;
    }
  }
  
  return -1;
}

function findInitialMetricIndex(
  evaluations: Evaluation[],
  metrics: Metric[],
  completedEvals: Set<number>,
  savedValues: Record<string, string> = {}
): number {
  // Buscar la primera evaluación no completada
  for (const evaluation of evaluations) {
    if (completedEvals.has(evaluation.id)) {
      continue;
    }
    
    const metricIndex = findFirstMetricInEvaluation(evaluation, metrics, savedValues);
    if (metricIndex !== -1) {
      return metricIndex;
    }
    
    break; // Solo procesar la primera evaluación no completada
  }
  
  return 0;
}

function getEvaluationMetricIds(evaluation: Evaluation): Set<number> {
  const metricIds = new Set<number>();
  
  for (const evalCriterion of evaluation.evaluation_criteria || []) {
    if (!evalCriterion.criterion?.subcriteria) continue;
    
    for (const subcriterion of evalCriterion.criterion.subcriteria) {
      if (!subcriterion.metrics) continue;
      
      for (const metric of subcriterion.metrics) {
        metricIds.add(metric.id);
      }
    }
  }
  
  return metricIds;
}

function findVariableId(allMetrics: Metric[], metricId: number, symbol: string): number {
  for (const metric of allMetrics) {
    if (metric.id !== metricId || !metric.variables) continue;
    
    const variable = metric.variables.find(v => v.symbol === symbol);
    if (variable) {
      return variable.id;
    }
  }
  
  return 0;
}

function buildVariablesToSubmit(
  variableValues: Record<string, string>,
  currentEvalMetricIds: Set<number>,
  allMetrics: Metric[]
) {
  return Object.entries(variableValues)
    .filter(([key]) => key.startsWith('metric-'))
    .map(([key, value]) => {
      const parts = key.split('-');
      if (parts.length < 3) return null;
      
      const metricId = Number.parseInt(parts[1], 10);
      const symbol = parts[2];
      
      if (!currentEvalMetricIds.has(metricId)) {
        return null;
      }
      
      const variableId = findVariableId(allMetrics, metricId, symbol);
      
      if (variableId === 0) {
        return null;
      }
      
      return {
        eval_metric_id: metricId,
        variable_id: variableId,
        symbol,
        value: Number.parseFloat(value.toString()) || 0
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null && item.variable_id > 0);
}

// Función auxiliar para verificar si una métrica pertenece a una evaluación
function metricBelongsToEvaluation(metric: Metric, evaluation: Evaluation): boolean {
  for (const ec of evaluation.evaluation_criteria || []) {
    if (!ec.criterion?.subcriteria) continue;
    
    for (const sc of ec.criterion.subcriteria) {
      if (sc.metrics?.some(m => m.id === metric.id)) {
        return true;
      }
    }
  }
  return false;
}

// Función auxiliar para encontrar evaluación que contiene una métrica
function findEvaluationForMetric(metric: Metric | undefined, evaluations: Evaluation[]): Evaluation | null {
  if (!metric) return null;
  
  for (const evaluation of evaluations) {
    if (metricBelongsToEvaluation(metric, evaluation)) {
      return evaluation;
    }
  }
  return null;
}

// Función auxiliar para obtener métricas de una evaluación
function getMetricsFromEvaluation(evaluation: Evaluation, allMetrics: Metric[]): Metric[] {
  return allMetrics.filter(metric => metricBelongsToEvaluation(metric, evaluation));
}

// Función auxiliar para encontrar índice de métrica que pertenece a evaluación
function findMetricIndexForEvaluation(evaluation: Evaluation, allMetrics: Metric[]): number {
  return allMetrics.findIndex(metric => metricBelongsToEvaluation(metric, evaluation));
}

// Función auxiliar para finalizar una evaluación pendiente
async function finalizePendingEvaluation(
  evaluation: Evaluation,
  variableValues: Record<string, string>,
  allMetrics: Metric[]
): Promise<void> {
  const evalMetricIds = getEvaluationMetricIds(evaluation);
  const variables = buildVariablesToSubmit(
    variableValues,
    evalMetricIds,
    allMetrics
  );
  
  if (variables.length > 0) {
    await submitEvaluationData(evaluation.id, variables);
  }
  
  await finalizeEvaluation(evaluation.id);
}

// Función auxiliar para finalizar todas las evaluaciones pendientes
async function finalizeAllPendingEvaluations(
  evaluations: Evaluation[],
  finalizedEvaluations: Set<number>,
  currentEvaluationId: number,
  variableValues: Record<string, string>,
  allMetrics: Metric[]
): Promise<void> {
  const pendingEvaluations = evaluations.filter(
    evaluation => !finalizedEvaluations.has(evaluation.id) && evaluation.id !== currentEvaluationId
  );
  
  if (pendingEvaluations.length === 0) {
    return;
  }
  
  for (const pendingEval of pendingEvaluations) {
    try {
      await finalizePendingEvaluation(pendingEval, variableValues, allMetrics);
    } catch (error) {
      console.error(`❌ Error al finalizar evaluación ${pendingEval.id}:`, error);
      throw new Error(`No se pudo finalizar la evaluación ${pendingEval.standard?.name || pendingEval.id}`);
    }
  }
}

function DataEntryContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = Number.parseInt(params.projectId as string, 10);
  const isValidProjectId = !Number.isNaN(projectId) && projectId > 0;

  // Estados principales
  const [project, setProject] = useState<Project | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para navegación
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0);
  const [allMetrics, setAllMetrics] = useState<Metric[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  // Estados para modal de finalización
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentEvaluationForModal, setCurrentEvaluationForModal] = useState<Evaluation | null>(null);
  const [isFinalizingProject, setIsFinalizingProject] = useState(false);
  const [finalizedEvaluations, setFinalizedEvaluations] = useState<Set<number>>(new Set());
  
  // Estados para modales de alerta
  const [showFinalizedModal, setShowFinalizedModal] = useState(false);
  const [showNextEvaluationModal, setShowNextEvaluationModal] = useState(false);
  const [nextEvaluationInfo, setNextEvaluationInfo] = useState<{ current: string; next: string } | null>(null);

  // Estados para feedback de guardado
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>(
    { message: '', type: 'info', isVisible: false }
  );

  // Estados para modal de error
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    details?: string;
  }>({ isOpen: false, title: '', message: '', details: '' });

  // Redireccionar a admins (solo verificación de rol)
  useEffect(() => {
    if (user && user.role?.name === 'admin') {
      router.push('/parameterization');
    }
  }, [user, router]);

  // Cargar datos del proyecto
  useEffect(() => {
    if (!isValidProjectId) {
      setError('ID de proyecto inválido');
      setLoading(false);
      return;
    }

    const loadProjectData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar proyecto
        const projectData = await fetchProjectData(projectId);
        setProject(projectData);

        // Cargar evaluaciones
        const evaluationsData = await fetchEvaluationsData(projectId);

        // Transformar datos
        const evaluationsWithMetrics = evaluationsData.map(transformEvaluationData);
        setEvaluations(evaluationsWithMetrics);

        // Cargar estados de evaluaciones
        const completedEvals = await fetchEvaluationStatuses(evaluationsWithMetrics);
        setFinalizedEvaluations(completedEvals);

        // Inicializar métricas y valores
        const { metrics, initialIndex, savedValues } = await initializeProjectMetrics(
          evaluationsWithMetrics,
          projectId,
          completedEvals
        );
        
        setAllMetrics(metrics);
        setVariableValues(savedValues);
        setCurrentMetricIndex(initialIndex);
        
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadProjectData().catch(() => {
      // Error handled in loadProjectData
    });
  }, [projectId, isValidProjectId]);

  // Función para guardar datos en el backend
  const saveCurrentMetricData = async () => {
    const metric = allMetrics[currentMetricIndex];
    if (!metric) {
      return;
    }
    
    const currentEval = getCurrentEvaluation();
    if (!currentEval) {
      return;
    }

    // Preparar variables de la métrica actual
    const variablesToSubmit = (metric.variables || [])
      .map(variable => {
        const key = `metric-${metric.id}-${variable.symbol}`;
        const value = variableValues[key];
        
        if (!value || value.trim() === '') return null;
        
        const varData = {
          eval_metric_id: metric.id,
          variable_id: variable.id,
          symbol: variable.symbol,
          value: Number.parseFloat(value) || 0
        };
        
        return varData;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (variablesToSubmit.length > 0) {
      try {
        setSaveStatus('saving');
        
        await submitEvaluationData(currentEval.id, variablesToSubmit);
        
        setSaveStatus('success');
        setToast({
          message: `Datos de "${metric.name}" guardados correctamente`,
          type: 'success',
          isVisible: true
        });
        
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        setSaveStatus('error');
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setToast({
          message: `Error al guardar: ${errorMessage}`,
          type: 'error',
          isVisible: true
        });
        console.error('❌ Error al guardar datos:', error);
      }
    }
  };

  // Función para manejar selección de métrica desde el sidebar
  const handleMetricSelect = async (evaluationIndex: number, metricGlobalIndex: number) => {
    // Verificar si la evaluación está finalizada
    const targetEvaluation = evaluations[evaluationIndex];
    if (targetEvaluation && finalizedEvaluations.has(targetEvaluation.id)) {
      setShowFinalizedModal(true);
      return;
    }
    
    // Guardar datos de la métrica actual antes de cambiar
    await saveCurrentMetricData();
    
    setCurrentMetricIndex(metricGlobalIndex);
  };

  // Función para actualizar valor de variable
  const handleVariableUpdate = (metricId: number, variableSymbol: string, value: string) => {
    const key = `metric-${metricId}-${variableSymbol}`;
    setVariableValues(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Guardar en localStorage
    const storageKey = `data-entry-project-${projectId}`;
    const updatedValues = { ...variableValues, [key]: value };
    localStorage.setItem(storageKey, JSON.stringify(updatedValues));
  };

  // Crear conjunto de IDs válidos de métricas
  const validMetricIds = useMemo(() => new Set(allMetrics.map(m => m.id)), [allMetrics]);

  // Cargar valores desde localStorage
  useEffect(() => {
    const storageKey = `data-entry-project-${projectId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsedValues = JSON.parse(stored);
        
        // Verificar si hay IDs inválidos (de versiones anteriores del código)
        const hasInvalidIds = Object.keys(parsedValues).some(key => {
          if (!key.startsWith('metric-')) return false;
          const metricId = Number.parseInt(key.split('-')[1], 10);
          return !validMetricIds.has(metricId);
        });
        
        if (hasInvalidIds && allMetrics.length > 0) {
          localStorage.removeItem(storageKey);
          setVariableValues({});
        } else {
          setVariableValues(parsedValues);
        }
      } catch {
        // Error parsing stored values, start fresh
        localStorage.removeItem(storageKey);
      }
    }
  }, [projectId, validMetricIds, allMetrics.length]);

  // Función para verificar si todas las variables de la métrica actual están llenas
  const areCurrentMetricVariablesFilled = (): boolean => {
    if (!currentMetric?.variables) return false;
    
    return currentMetric.variables.every(variable => {
      const key = `metric-${currentMetric.id}-${variable.symbol}`;
      const value = variableValues[key];
      return value !== undefined && value !== null && value !== '';
    });
  };

  // Función para obtener la evaluación actual basada en la métrica actual
  const getCurrentEvaluation = (): Evaluation | null => {
    return findEvaluationForMetric(allMetrics[currentMetricIndex], evaluations);
  };

  // Función para obtener la evaluación de una métrica específica por índice
  const getEvaluationByMetricIndex = (metricIndex: number): Evaluation | null => {
    return findEvaluationForMetric(allMetrics[metricIndex], evaluations);
  };

  // Función para verificar si es la última métrica de una evaluación
  const isLastMetricOfEvaluation = (): boolean => {
    const currentEval = getCurrentEvaluation();
    if (!currentEval || !currentMetric) return false;

    const evalMetrics = getMetricsFromEvaluation(currentEval, allMetrics);
    const lastMetricOfEval = evalMetrics.at(-1);
    return currentMetric.id === lastMetricOfEval?.id;
  };

  // Función para verificar si es la última evaluación del proyecto
  const isLastEvaluationOfProject = (): boolean => {
    const currentEval = getCurrentEvaluation();
    if (!currentEval) return false;
    return currentEval.id === evaluations.at(-1)?.id;
  };

  // Función para calcular la acción del botón primario
  const calculatePrimaryAction = (): PrimaryButtonAction => {
    const allVariablesFilled = areCurrentMetricVariablesFilled();
    
    if (!allVariablesFilled) {
      return 'disabled';
    }

    const isLastMetric = isLastMetricOfEvaluation();
    const isLastEvaluation = isLastEvaluationOfProject();

    if (isLastMetric && isLastEvaluation) {
      return 'finish-project';
    } else if (isLastMetric) {
      return 'finish-evaluation';
    } else {
      return 'next';
    }
  };

  // Handler para terminar evaluación
  const handleFinishEvaluation = async () => {
    const currentEval = getCurrentEvaluation();
    if (!currentEval) return;

    // Verificar si ya está finalizada
    if (finalizedEvaluations.has(currentEval.id)) {
      alert('Esta evaluación ya ha sido finalizada.');
      return;
    }

    // Guardar datos de la métrica actual antes de finalizar
    await saveCurrentMetricData();

    setCurrentEvaluationForModal(currentEval);
    setIsFinalizingProject(false);
    setIsModalOpen(true);
  };

  // Handler para terminar proyecto
  const handleFinishProject = async () => {
    const currentEval = getCurrentEvaluation();
    if (!currentEval) return;

    // Guardar datos de la métrica actual antes de finalizar
    await saveCurrentMetricData();

    setCurrentEvaluationForModal(currentEval);
    setIsFinalizingProject(true);
    setIsModalOpen(true);
  };

  // Handler para confirmar finalización desde el modal
  const handleModalConfirm = async () => {
    if (!currentEvaluationForModal) return;

    try {
      setModalLoading(true);
      await finalizeCurrentEvaluation();
      
      if (isFinalizingProject) {
        await handleProjectFinalization();
      } else {
        handleNextEvaluationNavigation();
      }
    } catch (error) {
      handleFinalizationError(error);
    }
  };

  // Finalizar la evaluación actual
  const finalizeCurrentEvaluation = async () => {
    if (!currentEvaluationForModal) return;

    const currentEvalMetricIds = getEvaluationMetricIds(currentEvaluationForModal);
    const variablesToSubmit = buildVariablesToSubmit(
      variableValues,
      currentEvalMetricIds,
      allMetrics
    );

    await submitEvaluationData(currentEvaluationForModal.id, variablesToSubmit);
    await finalizeEvaluation(currentEvaluationForModal.id);
    
    setFinalizedEvaluations(prev => new Set([...prev, currentEvaluationForModal.id]));
  };

  // Manejar la finalización del proyecto completo
  const handleProjectFinalization = async () => {
    await finalizeAllPendingEvaluations(
      evaluations,
      finalizedEvaluations,
      currentEvaluationForModal!.id,
      variableValues,
      allMetrics
    );
    
    await finalizeProject(projectId);
    localStorage.removeItem(`data-entry-project-${projectId}`);
    router.push(`/results/project/${projectId}/report`);
  };

  // Manejar navegación a siguiente evaluación
  const handleNextEvaluationNavigation = () => {
    if (!currentEvaluationForModal) return;

    const currentEvalIndex = evaluations.findIndex(e => e.id === currentEvaluationForModal.id);
    const hasNextEvaluation = currentEvalIndex < evaluations.length - 1;
    
    if (hasNextEvaluation) {
      const nextEval = evaluations[currentEvalIndex + 1];
      setNextEvaluationInfo({
        current: currentEvaluationForModal.standard.name,
        next: nextEval.standard?.name || 'Siguiente evaluación'
      });
      setIsModalOpen(false);
      setShowNextEvaluationModal(true);
    } else {
      setIsModalOpen(false);
    }
  };

  // Manejar errores de finalización
  const handleFinalizationError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error durante la finalización:', error);
    
    setErrorModal({
      isOpen: true,
      title: 'Error al finalizar evaluación',
      message: errorMessage,
      details: 'Verifique que todos los datos sean correctos y que tenga conexión a internet. Si el problema persiste, intente nuevamente.'
    });
    
    setToast({
      message: `Error: ${errorMessage}`,
      type: 'error',
      isVisible: true
    });
    
    setModalLoading(false);
  };

  // Estados de carga y error
  if (loading) {
    return (
      <div className="data-entry">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="data-entry">
        <div className="error-container">
          <h2>Error al cargar el proyecto</h2>
          <p>{error}</p>
          <button onClick={() => globalThis.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!project || evaluations.length === 0) {
    return (
      <div className="data-entry">
        <div className="empty-state">
          <h3>No hay evaluaciones disponibles</h3>
          <p>Este proyecto no tiene evaluaciones configuradas.</p>
          <button onClick={() => router.push('/dashboard')}>
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentMetric = allMetrics[currentMetricIndex];
  const currentEvaluation = getCurrentEvaluation();
  const isCurrentEvaluationFinalized = currentEvaluation ? finalizedEvaluations.has(currentEvaluation.id) : false;

  // Funciones auxiliares para handlers
  const handlePreviousMetric = async () => {
    if (currentMetricIndex === 0) return;
    
    const previousEval = getEvaluationByMetricIndex(currentMetricIndex - 1);
    if (previousEval && finalizedEvaluations.has(previousEval.id)) {
      setShowFinalizedModal(true);
      return;
    }
    
    await saveCurrentMetricData();
    setCurrentMetricIndex(currentMetricIndex - 1);
  };

  const handleNextMetric = async () => {
    if (currentMetricIndex >= allMetrics.length - 1) return;
    
    const nextEval = getEvaluationByMetricIndex(currentMetricIndex + 1);
    if (nextEval && finalizedEvaluations.has(nextEval.id)) {
      setShowFinalizedModal(true);
      return;
    }
    
    await saveCurrentMetricData();
    setCurrentMetricIndex(currentMetricIndex + 1);
  };

  const getMetricsForCurrentEvaluation = (): Metric[] => {
    if (!currentEvaluationForModal) return [];
    
    const metrics: Metric[] = [];
    for (const evalCriterion of currentEvaluationForModal.evaluation_criteria || []) {
      if (!evalCriterion.criterion?.subcriteria) continue;
      
      for (const subcriterion of evalCriterion.criterion.subcriteria) {
        if (subcriterion.metrics) {
          metrics.push(...subcriterion.metrics);
        }
      }
    }
    return metrics;
  };

  const isMetricCompleted = (metric: Metric): boolean => {
    const metricVariables = metric.variables || [];
    if (metricVariables.length === 0) return true;
    
    return metricVariables.every(v => {
      const key = `metric-${metric.id}-${v.symbol}`;
      const value = variableValues[key];
      return value !== undefined && value !== null && value !== '';
    });
  };

  const getCompletedMetricsCount = (metrics: Metric[]): number => {
    return metrics.filter(isMetricCompleted).length;
  };

  const getVariablesForModal = (metrics: Metric[]) => {
    return metrics.flatMap(metric => 
      (metric.variables || []).map(v => {
        const key = `metric-${metric.id}-${v.symbol}`;
        return {
          metric_name: metric.name,
          variable_symbol: v.symbol,
          variable_value: variableValues[key] || ''
        };
      }).filter(v => v.variable_value)
    );
  };

  // Handler para confirmar avance a siguiente evaluación
  const handleConfirmNextEvaluation = () => {
    const currentEvalIndex = evaluations.findIndex(e => e.id === currentEvaluationForModal?.id);
    const hasNextEval = currentEvalIndex < evaluations.length - 1;
    
    if (hasNextEval) {
      const nextEval = evaluations[currentEvalIndex + 1];
      const nextMetricIndex = findMetricIndexForEvaluation(nextEval, allMetrics);
      
      if (nextMetricIndex !== -1) {
        setCurrentMetricIndex(nextMetricIndex);
      }
    }
    
    setShowNextEvaluationModal(false);
    setNextEvaluationInfo(null);
  };

  return (
    <div className="enterDataLayout">
      {/* Contenido principal en grid */}
      <div className="mainContent">
        {/* Breadcrumb directo sin contenedor */}
        <div className="breadcrumb-container">
          <Breadcrumbs
             items={[
               { label: '◁ Dashboard', onClick: () => router.push('/dashboard') }
             ]}
           />
        </div>
        {/* Sidebar izquierdo con wrapper */}
        <div className="sidebarWrapper">
          <DataEntryHierarchy
            evaluations={evaluations}
            currentMetricIndex={currentMetricIndex}
            allMetrics={allMetrics}
            variableValues={variableValues}
            onMetricSelect={handleMetricSelect}
            finalizedEvaluations={finalizedEvaluations}
            projectName={project.name}
          />
        </div>

        {/* Contenido central */}
        <div className="content">
          {/* Banner de advertencia si la evaluación está finalizada */}
          {isCurrentEvaluationFinalized && (
            <AlertBanner
              type="warning"
              title="Evaluación Finalizada"
              message="Esta evaluación ya fue completada. No puedes editar los datos ingresados. Los valores mostrados son de solo lectura."
              visible={true}
            />
          )}
          
          <div className="metricContainer">
            {currentMetric ? (
              <MetricCard
                number={currentMetricIndex + 1}
                name={currentMetric.name}
                description={currentMetric.description}
                formula={currentMetric.formula}
                desiredThreshold={currentMetric.desired_threshold}
                worstCase={currentMetric.worst_case}
                variables={currentMetric.variables || []}
                values={Object.fromEntries(
                  Object.entries(variableValues)
                    .filter(([key]) => key.startsWith(`metric-${currentMetric.id}-`))
                    .map(([key, value]) => {
                      const parts = key.split('-');
                      return parts.length >= 3 ? [parts[2], value] : null;
                    })
                    .filter((entry): entry is [string, string] => entry !== null)
                )}
                onValueChange={(symbol, value) => {
                  handleVariableUpdate(currentMetric.id, symbol, value);
                }}
                onPrevious={handlePreviousMetric}
                onNext={handleNextMetric}
                onFinishEvaluation={handleFinishEvaluation}
                onFinishProject={handleFinishProject}
                isFirstMetric={currentMetricIndex === 0}
                primaryAction={calculatePrimaryAction()}
              />
            ) : (
              <div className="emptyState">
                <h3>No hay métricas disponibles</h3>
                <p>Selecciona una métrica del sidebar para comenzar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de evaluación finalizada */}
      <FinalizedEvaluationModal
        isOpen={showFinalizedModal}
        onClose={() => setShowFinalizedModal(false)}
      />

      {/* Modal de siguiente evaluación */}
      {nextEvaluationInfo && (
        <NextEvaluationModal
          isOpen={showNextEvaluationModal}
          currentEvaluationName={nextEvaluationInfo.current}
          nextEvaluationName={nextEvaluationInfo.next}
          onConfirm={handleConfirmNextEvaluation}
          onCancel={() => {
            setShowNextEvaluationModal(false);
            setNextEvaluationInfo(null);
          }}
        />
      )}

      {/* Modal de confirmación */}
      {currentEvaluationForModal && (() => {
        const currentEvalMetrics = getMetricsForCurrentEvaluation();

        return (
          <EvaluationCompleteModal
            isOpen={isModalOpen}
            evaluationName={currentEvaluationForModal.standard.name}
            isLastEvaluation={isFinalizingProject}
            completedMetrics={getCompletedMetricsCount(currentEvalMetrics)}
            totalMetrics={currentEvalMetrics.length}
            variables={getVariablesForModal(currentEvalMetrics)}
            onConfirm={handleModalConfirm}
            onCancel={() => setIsModalOpen(false)}
            loading={modalLoading}
          />
        );
      })()}

      {/* Toast de notificaciones */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
        duration={3000}
      />

      {/* Indicador de guardado en curso */}
      <SaveIndicator isVisible={saveStatus === 'saving'} />

      {/* Modal de error mejorado */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        title={errorModal.title}
        message={errorModal.message}
        details={errorModal.details}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
      />
    </div>
  );
}

export default function DataEntryProjectPage() {
  return (
    <ProtectedRoute requiredRole="evaluator">
      <DataEntryContent />
    </ProtectedRoute>
  );
}
