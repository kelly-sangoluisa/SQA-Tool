'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import '@/styles/data-entry/data-entry.css';
import { DataEntryHierarchy } from '@/components/data-entry/DataEntryHierarchy';
import { MetricCard } from '@/components/data-entry/MetricCard';
import { EvaluationCompleteModal } from '@/components/data-entry/EvaluationCompleteModal';
import { submitEvaluationData, finalizeEvaluation, finalizeProject } from '@/api/entry-data/entry-data-api';

// Interfaces de tipos
interface Variable {
  id: number;
  metric_id: number;
  symbol: string;
  description: string;
  state: string;
}

interface Metric {
  id: number;
  name: string;
  description: string;
  formula: string;
  variables?: Variable[];
}

interface Subcriterion {
  id: number;
  name: string;
  description?: string;
  criterion_id: number;
  state: string;
  metrics?: Metric[];
  created_at: string;
  updated_at: string;
}

// Note: Criterion interface defined but not currently used in this file
// Kept for potential future use
// interface Criterion {
//   id: number;
//   name: string;
//   description?: string;
//   subcriteria?: Subcriterion[];
// }

interface Evaluation {
  id: number;
  project_id: number;
  standard_id: number;
  creation_date: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  standard: {
    id: number;
    name: string;
    version: string;
  };
  evaluation_criteria: Array<{
    id: number;
    evaluation_id: number;
    criterion_id: number;
    importance_level: string;
    importance_percentage: number;
    criterion: {
      id: number;
      name: string;
      description?: string;
      subcriteria?: Subcriterion[];
    };
  }>;
}

interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
}

interface ProjectProgress {
  project_id: number;
  total_evaluations: number;
  completed_evaluations: number;
  in_progress_evaluations: number;
  total_metrics: number;
  completed_metrics: number;
  overall_progress_percentage: number;
}

export default function DataEntryProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoading, isAuthenticated, user } = useAuth();
  const projectId = Number.parseInt(params.projectId as string, 10);
  const isValidProjectId = !Number.isNaN(projectId) && projectId > 0;

  // Estados principales
  const [project, setProject] = useState<Project | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [projectProgress, setProjectProgress] = useState<ProjectProgress | null>(null);
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

  // Verificar autenticación y permisos
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    // Solo evaluadores pueden acceder a entrada de datos
    if (!isLoading && user && user.role?.name === 'admin') {
      router.push('/parameterization');
      return;
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Cargar datos del proyecto
  useEffect(() => {
    if (!isAuthenticated || !isValidProjectId) {
      if (isAuthenticated && !isValidProjectId) {
        setError('ID de proyecto inválido');
        setLoading(false);
      }
      return;
    }

    const loadProjectData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar proyecto
        const projectResponse = await fetch(`/api/config-evaluation/projects/${projectId}`);
        if (!projectResponse.ok) throw new Error('Error al cargar proyecto');
        
        let projectData;
        try {
          projectData = await projectResponse.json();
        } catch {
          throw new Error('Respuesta inválida del servidor');
        }
        setProject(projectData);

        // Cargar evaluaciones del proyecto desde la API
        const evaluationsResponse = await fetch(`/api/config-evaluation/projects/${projectId}/evaluations`);
        if (!evaluationsResponse.ok) throw new Error('Error al cargar evaluaciones');
        
        let evaluationsData;
        try {
          evaluationsData = await evaluationsResponse.json();
        } catch {
          throw new Error('Respuesta inválida al cargar evaluaciones');
        }

        // Transformar datos: mapear evaluation_metrics a métricas en subcriteria
        const evaluationsWithMetrics = (Array.isArray(evaluationsData) ? evaluationsData : []).map((evaluation: any) => {
          // Crear un mapa de métricas por sub_criterion_id desde evaluation_metrics
          const metricsBySubcriterion = new Map<number, any[]>();
          
          // Procesar evaluation_metrics para extraer métricas
          (evaluation.evaluation_criteria || []).forEach((evalCriterion: any) => {
            (evalCriterion.evaluation_metrics || []).forEach((evalMetric: any) => {
              const metric = evalMetric.metric || {};
              const subCriterionId = metric.sub_criterion_id;
              
              if (subCriterionId) {
                if (!metricsBySubcriterion.has(subCriterionId)) {
                  metricsBySubcriterion.set(subCriterionId, []);
                }
                
                // Agregar métrica con sus variables
                const existingMetrics = metricsBySubcriterion.get(subCriterionId) || [];
                const metricExists = existingMetrics.some(m => m.id === metric.id);
                
                if (!metricExists) {
                  metricsBySubcriterion.get(subCriterionId)!.push({
                    id: metric.id,
                    name: metric.name,
                    description: metric.description,
                    formula: metric.formula,
                    code: metric.code,
                    variables: (metric.variables || []).map((v: any) => ({
                      id: v.id,
                      metric_id: metric.id,
                      symbol: v.symbol,
                      description: v.description,
                      state: v.state
                    }))
                  });
                }
              }
            });
          });

          return {
            ...evaluation,
            evaluation_criteria: (evaluation.evaluation_criteria || []).map((evalCriterion: any) => ({
              ...evalCriterion,
              criterion: {
                ...evalCriterion.criterion,
                subcriteria: (evalCriterion.criterion?.sub_criteria || []).map((subcriterion: any) => {
                  // Obtener métricas de evaluation_metrics o de sub_criteria.metrics si existen
                  const metricsFromEvalMetrics = metricsBySubcriterion.get(subcriterion.id) || [];
                  const metricsFromSubcriterion = (subcriterion.metrics || []).map((m: any) => ({
                    id: m.id,
                    name: m.name,
                    description: m.description,
                    formula: m.formula,
                    code: m.code,
                    variables: (m.variables || []).map((v: any) => ({
                      id: v.id,
                      metric_id: m.id,
                      symbol: v.symbol,
                      description: v.description,
                      state: v.state
                    }))
                  }));
                  
                  // Combinar: si hay en evaluation_metrics usa esos, sino usa los del subcriterion
                  const finalMetrics = metricsFromEvalMetrics.length > 0 ? metricsFromEvalMetrics : metricsFromSubcriterion;
                  
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
                })
              }
            }))
          };
        });

        setEvaluations(evaluationsWithMetrics);
        
        // Cargar progreso del proyecto
        const progressResponse = await fetch(`/api/entry-data/projects/${projectId}/progress`);
        if (progressResponse.ok) {
          try {
            const progressData = await progressResponse.json();
            setProjectProgress(progressData);
          } catch {
            // Continue without progress data or let it fail? 
            // If we don't throw, the page loads but progress is missing.
            // If we throw, the page shows error.
            // Let's throw to be consistent with projectData.
            throw new Error('Error al procesar datos de progreso');
          }
        } else {
          // Progreso mock si no existe el endpoint
          const mockProgress = {
            project_id: projectId,
            total_evaluations: evaluationsWithMetrics.length,
            completed_evaluations: 0,
            in_progress_evaluations: evaluationsWithMetrics.length,
            total_metrics: 0,
            completed_metrics: 0,
            overall_progress_percentage: 0
          };
          setProjectProgress(mockProgress);
        }

        // Procesar métricas de todas las evaluaciones
        const metrics: Metric[] = [];
        for (const evaluation of evaluationsWithMetrics) {
          for (const evalCriterion of evaluation.evaluation_criteria) {
            if (evalCriterion.criterion.subcriteria && evalCriterion.criterion.subcriteria.length > 0) {
              for (const subcriterion of evalCriterion.criterion.subcriteria) {
                if (subcriterion.metrics && subcriterion.metrics.length > 0) {
                  metrics.push(...subcriterion.metrics);
                }
              }
            }
          }
        }
        
        setAllMetrics(metrics);
        
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadProjectData().catch(() => {
      // Error handled in loadProjectData
    });
  }, [isAuthenticated, projectId, isValidProjectId]);

  // Función para manejar selección de métrica desde el sidebar
  const handleMetricSelect = (evaluationIndex: number, metricGlobalIndex: number) => {
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

  // Cargar valores desde localStorage
  useEffect(() => {
    const storageKey = `data-entry-project-${projectId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setVariableValues(JSON.parse(stored));
      } catch {
        // Error parsing stored values, start fresh
      }
    }
  }, [projectId]);

  // Función para verificar si todas las variables de la métrica actual están llenas
  const areCurrentMetricVariablesFilled = (): boolean => {
    if (!currentMetric || !currentMetric.variables) return false;
    
    return currentMetric.variables.every(variable => {
      const key = `metric-${currentMetric.id}-${variable.symbol}`;
      const value = variableValues[key];
      return value !== undefined && value !== null && value !== '';
    });
  };

  // Función para obtener la evaluación actual basada en la métrica actual
  const getCurrentEvaluation = (): Evaluation | null => {
    if (!currentMetric) return null;
    
    for (const evaluation of evaluations) {
      for (const ec of evaluation.evaluation_criteria) {
        if (ec.criterion.subcriteria) {
          for (const sc of ec.criterion.subcriteria) {
            if (sc.metrics?.some(m => m.id === currentMetric.id)) {
              return evaluation;
            }
          }
        }
      }
    }
    return null;
  };

  // Función para verificar si es la última métrica de una evaluación
  const isLastMetricOfEvaluation = (): boolean => {
    const currentEval = getCurrentEvaluation();
    if (!currentEval) return false;

    const evalMetrics = allMetrics.filter(metric => {
      return currentEval.evaluation_criteria.some(ec =>
        ec.criterion.subcriteria?.some(sc =>
          sc.metrics?.some(m => m.id === metric.id)
        )
      );
    });

    const lastMetricOfEval = evalMetrics[evalMetrics.length - 1];
    return currentMetric?.id === lastMetricOfEval?.id;
  };

  // Función para verificar si es la última evaluación del proyecto
  const isLastEvaluationOfProject = (): boolean => {
    const currentEval = getCurrentEvaluation();
    if (!currentEval) return false;
    return currentEval.id === evaluations[evaluations.length - 1]?.id;
  };

  // Handler para terminar evaluación
  const handleFinishEvaluation = () => {
    const currentEval = getCurrentEvaluation();
    if (!currentEval) return;

    setCurrentEvaluationForModal(currentEval);
    setIsFinalizingProject(false);
    setIsModalOpen(true);
  };

  // Handler para terminar proyecto
  const handleFinishProject = () => {
    const currentEval = getCurrentEvaluation();
    if (!currentEval) return;

    setCurrentEvaluationForModal(currentEval);
    setIsFinalizingProject(true);
    setIsModalOpen(true);
  };

  // Handler para confirmar finalización desde el modal
  const handleModalConfirm = async () => {
    if (!currentEvaluationForModal) return;

    try {
      setModalLoading(true);

      // Preparar datos de variables para enviar
      const variablesToSubmit = Object.entries(variableValues)
        .filter(([key]) => key.startsWith('metric-'))
        .map(([key, value]) => {
          const parts = key.split('-');
          if (parts.length < 3) {
            return null;
          }
          const metricId = parseInt(parts[1]);
          const symbol = parts[2];
          
          // Buscar la variable para obtener su ID
          let variableId = 0;
          for (const metric of allMetrics) {
            if (metric.id === metricId && metric.variables) {
              const variable = metric.variables.find(v => v.symbol === symbol);
              if (variable) {
                variableId = variable.id;
                break;
              }
            }
          }
          
          return {
            metric_id: metricId,
            variable_id: variableId,
            symbol,
            value: value.toString()
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      // Primero enviar los datos
      await submitEvaluationData(currentEvaluationForModal.id, variablesToSubmit);

      if (isFinalizingProject) {
        // Finalizar proyecto completo
        await finalizeProject(projectId);
        
        // Marcar evaluación actual como finalizada
        setFinalizedEvaluations(prev => new Set([...prev, currentEvaluationForModal.id]));
        
        // Limpiar localStorage
        localStorage.removeItem(`data-entry-project-${projectId}`);
        
        // Navegar a resultados del proyecto
        router.push(`/results/project/${projectId}/report`);
      } else {
        // Solo finalizar evaluación
        await finalizeEvaluation(currentEvaluationForModal.id);
        
        // Marcar evaluación como finalizada DESPUÉS de confirmar en backend
        setFinalizedEvaluations(prev => new Set([...prev, currentEvaluationForModal.id]));
        
        // Avanzar a la siguiente evaluación si existe
        const currentEvalIndex = evaluations.findIndex(e => e.id === currentEvaluationForModal.id);
        if (currentEvalIndex < evaluations.length - 1) {
          // Encontrar la primera métrica de la siguiente evaluación
          const nextEval = evaluations[currentEvalIndex + 1];
          const nextMetricIndex = allMetrics.findIndex(metric => 
            nextEval.evaluation_criteria.some(ec =>
              ec.criterion.subcriteria?.some(sc =>
                sc.metrics?.some(m => m.id === metric.id)
              )
            )
          );
          
          if (nextMetricIndex !== -1) {
            setCurrentMetricIndex(nextMetricIndex);
          }
        }
        
        setIsModalOpen(false);
      }
    } catch {
      alert('Error al finalizar. Por favor intenta de nuevo.');
    } finally {
      setModalLoading(false);
    }
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
          <button onClick={() => window.location.reload()}>
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

  return (
    <div className="enterDataLayout">
      {/* Contenido principal en grid */}
      <div className="mainContent">
        {/* Sidebar izquierdo con wrapper */}
        <div className="sidebarWrapper">
          <DataEntryHierarchy
            evaluations={evaluations}
            currentMetricIndex={currentMetricIndex}
            allMetrics={allMetrics}
            variableValues={variableValues}
            onMetricSelect={handleMetricSelect}
            finalizedEvaluations={finalizedEvaluations}
          />
        </div>

        {/* Contenido central */}
        <div className="content">          
          <div className="metricContainer">
            {currentMetric ? (
              <MetricCard
                number={currentMetricIndex + 1}
                name={currentMetric.name}
                description={currentMetric.description}
                formula={currentMetric.formula}
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
                onPrevious={() => {
                  if (currentMetricIndex > 0) {
                    setCurrentMetricIndex(currentMetricIndex - 1);
                  }
                }}
                onNext={() => {
                  if (currentMetricIndex < allMetrics.length - 1) {
                    setCurrentMetricIndex(currentMetricIndex + 1);
                  }
                }}
                onFinishEvaluation={handleFinishEvaluation}
                onFinishProject={handleFinishProject}
                isFirstMetric={currentMetricIndex === 0}
                isLastMetric={isLastMetricOfEvaluation()}
                isLastEvaluation={isLastEvaluationOfProject()}
                allVariablesFilled={areCurrentMetricVariablesFilled()}
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

      {/* Modal de confirmación */}
      {currentEvaluationForModal && (
        <EvaluationCompleteModal
          isOpen={isModalOpen}
          evaluationName={currentEvaluationForModal.standard.name}
          isLastEvaluation={isFinalizingProject}
          completedMetrics={Object.keys(variableValues).filter(key => variableValues[key]).length}
          totalMetrics={allMetrics.length}
          variables={allMetrics.flatMap(metric => 
            (metric.variables || []).map(v => {
              const key = `metric-${metric.id}-${v.symbol}`;
              return {
                metric_name: metric.name,
                variable_symbol: v.symbol,
                variable_value: variableValues[key] || ''
              };
            }).filter(v => v.variable_value)
          )}
          onConfirm={handleModalConfirm}
          onCancel={() => setIsModalOpen(false)}
          loading={modalLoading}
        />
      )}
    </div>
  );
}
