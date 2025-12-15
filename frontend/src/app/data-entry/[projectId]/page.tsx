'use client';

import { useState, useEffect, useMemo } from 'react';
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
  [key: string]: unknown;
}

interface Metric {
  id: number;
  name: string;
  description: string;
  formula: string;
  code?: string;
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

// API response types
interface EvaluationMetricAPI {
  id?: number;
  metric?: {
    id: number;
    name: string;
    description: string;
    formula: string;
    code?: string;
    sub_criterion_id?: number;
    variables?: Array<{
      id: number;
      symbol: string;
      description: string;
      state: string;
    }>;
  };
}

interface EvaluationCriterionAPI {
  id: number;
  evaluation_id: number;
  criterion_id: number;
  importance_level: string;
  importance_percentage: number;
  criterion?: {
    id: number;
    name: string;
    description?: string;
    sub_criteria?: Array<{
      id: number;
      name: string;
      description?: string;
      criterion_id: number;
      state: string;
      metrics?: Metric[];
      created_at: string;
      updated_at: string;
    }>;
  };
  evaluation_metrics?: EvaluationMetricAPI[];
}

interface EvaluationDataAPI {
  id: number;
  project_id: number;
  standard_id: number;
  creation_date: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  standard?: {
    id: number;
    name: string;
    version: string;
  };
  evaluation_criteria?: EvaluationCriterionAPI[];
}

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
      sub_criteria?: Array<{
        id: number;
        name: string;
        description?: string;
        criterion_id: number;
        state: string;
        metrics?: Metric[];
        created_at: string;
        updated_at: string;
      }>;
    };
    evaluation_metrics?: EvaluationMetricAPI[];
  }>;
}

interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
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
        const evaluationsWithMetrics = (Array.isArray(evaluationsData) ? evaluationsData : []).map((evaluation: EvaluationDataAPI) => {
          // Crear un mapa de métricas por sub_criterion_id desde evaluation_metrics
          const metricsBySubcriterion = new Map<number, Metric[]>();

          // Procesar evaluation_metrics para extraer métricas
          (evaluation.evaluation_criteria || []).forEach((evalCriterion: EvaluationCriterionAPI) => {
            (evalCriterion.evaluation_metrics || []).forEach((evalMetric: EvaluationMetricAPI) => {
              const metric = evalMetric.metric;
              if (!metric) return;

              const subCriterionId = metric.sub_criterion_id;
              if (subCriterionId) {
                if (!metricsBySubcriterion.has(subCriterionId)) {
                  metricsBySubcriterion.set(subCriterionId, []);
                }
                
                // Agregar métrica con sus variables
                const existingMetrics = metricsBySubcriterion.get(subCriterionId) || [];
                const metricExists = existingMetrics.some(m => m.id === evalMetric.id);
                
                if (!metricExists) {
                  const metricId = evalMetric.id || metric.id || 0;
                  metricsBySubcriterion.get(subCriterionId)!.push({
                    id: metricId, // CRÍTICO: usar evalMetric.id (evaluation_metrics.id) NO metric.id
                    name: metric.name,
                    description: metric.description,
                    formula: metric.formula,
                    code: metric.code,
                    variables: (metric.variables || []).map((v) => ({
                      id: v.id,
                      metric_id: metricId, // CRÍTICO: usar evalMetric.id
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
            standard: evaluation.standard || { id: 0, name: 'Unknown', version: '0.0' },
            evaluation_criteria: (evaluation.evaluation_criteria || []).map((evalCriterion: EvaluationCriterionAPI) => ({
              ...evalCriterion,
              criterion: {
                id: evalCriterion.criterion?.id || 0,
                name: evalCriterion.criterion?.name || 'Unknown',
                description: evalCriterion.criterion?.description,
                subcriteria: (evalCriterion.criterion?.sub_criteria || []).map((subcriterion) => {
                  // Obtener métricas de evaluation_metrics o de sub_criteria.metrics si existen
                  const metricsFromEvalMetrics = metricsBySubcriterion.get(subcriterion.id) || [];
                  const metricsFromSubcriterion = (subcriterion.metrics || []).map((m) => ({
                    id: m.id,
                    name: m.name,
                    description: m.description,
                    formula: m.formula,
                    code: m.code,
                    variables: (m.variables || []).map((v) => ({
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

        setEvaluations(evaluationsWithMetrics as Evaluation[]);

        // Cargar estado de cada evaluación para determinar cuáles están finalizadas
        const completedEvals = new Set<number>();
        for (const evaluation of evaluationsWithMetrics) {
          try {
            const statusResponse = await fetch(`/api/entry-data/evaluations/${evaluation.id}/status`);
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              if (statusData.status === 'completed') {
                completedEvals.add(evaluation.id);
              }
            }
          } catch {
            console.warn(`No se pudo verificar estado de evaluación ${evaluation.id}`);
          }
        }
        setFinalizedEvaluations(completedEvals);

        // Construir lista plana de métricas
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

  // Función para guardar datos en el backend
  const saveCurrentMetricData = async () => {
    const metric = allMetrics[currentMetricIndex];
    if (!metric) {
      console.log('⚠️ No hay métrica actual para guardar');
      return;
    }
    
    console.log('🔍 DEBUG - Métrica a guardar:', {
      metricId: metric.id,
      metricName: metric.name,
      currentMetricIndex,
      allMetricsLength: allMetrics.length
    });
    
    const currentEval = getCurrentEvaluation();
    if (!currentEval) {
      console.log('⚠️ No se encontró la evaluación actual');
      return;
    }

    // Preparar variables de la métrica actual
    const variablesToSubmit = (metric.variables || [])
      .map(variable => {
        const key = `metric-${metric.id}-${variable.symbol}`;
        const value = variableValues[key];
        
        if (!value || value.trim() === '') return null;
        
        const varData = {
          eval_metric_id: metric.id, // CRÍTICO: usar eval_metric_id para el backend
          variable_id: variable.id,
          symbol: variable.symbol,
          value: parseFloat(value) || 0 // Enviar como número
        };
        
        console.log('🔍 DEBUG - Variable mapeada:', varData);
        
        return varData;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (variablesToSubmit.length > 0) {
      try {
        console.log(`💾 Guardando ${variablesToSubmit.length} variables de la métrica "${metric.name}"...`);
        await submitEvaluationData(currentEval.id, variablesToSubmit);
        console.log('✅ Datos guardados correctamente');
      } catch (error) {
        console.error('❌ Error al guardar datos:', error);
        // No mostramos alert para no interrumpir el flujo
      }
    } else {
      console.log('ℹ️ No hay datos nuevos para guardar en esta métrica');
    }
  };

  // Función para manejar selección de métrica desde el sidebar
  const handleMetricSelect = async (evaluationIndex: number, metricGlobalIndex: number) => {
    // Verificar si la evaluación está finalizada
    const targetEvaluation = evaluations[evaluationIndex];
    if (targetEvaluation && finalizedEvaluations.has(targetEvaluation.id)) {
      alert('Esta evaluación ya ha sido finalizada y no se puede editar.');
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
          const metricId = parseInt(key.split('-')[1]);
          return !validMetricIds.has(metricId);
        });
        
        if (hasInvalidIds && allMetrics.length > 0) {
          console.warn('⚠️ Detectados IDs inválidos en localStorage. Limpiando datos antiguos...');
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
    if (!currentMetric || !currentMetric.variables) return false;
    
    return currentMetric.variables.every(variable => {
      const key = `metric-${currentMetric.id}-${variable.symbol}`;
      const value = variableValues[key];
      return value !== undefined && value !== null && value !== '';
    });
  };

  // Función para obtener la evaluación actual basada en la métrica actual
  const getCurrentEvaluation = (): Evaluation | null => {
    const metric = allMetrics[currentMetricIndex];
    if (!metric) return null;
    
    for (const evaluation of evaluations) {
      for (const ec of evaluation.evaluation_criteria || []) {
        if (ec.criterion?.subcriteria) {
          for (const sc of ec.criterion.subcriteria) {
            if (sc.metrics?.some(m => m.id === metric.id)) {
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
      return (currentEval.evaluation_criteria || []).some(ec =>
        ec.criterion?.subcriteria?.some(sc =>
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

      // Preparar datos de variables para enviar
      console.log('🔍 DEBUG: allMetrics IDs:', allMetrics.map(m => ({ id: m.id, name: m.name })));
      console.log('🔍 DEBUG: variableValues keys:', Object.keys(variableValues));
      
      const variablesToSubmit = Object.entries(variableValues)
        .filter(([key]) => key.startsWith('metric-'))
        .map(([key, value]) => {
          const parts = key.split('-');
          if (parts.length < 3) {
            return null;
          }
          const metricId = parseInt(parts[1]);
          const symbol = parts[2];
          
          console.log(`🔍 DEBUG: Processing key=${key}, metricId=${metricId}, symbol=${symbol}`);
          
          // Buscar la variable para obtener su ID
          let variableId = 0;
          for (const metric of allMetrics) {
            if (metric.id === metricId && metric.variables) {
              const variable = metric.variables.find(v => v.symbol === symbol);
              if (variable) {
                variableId = variable.id;
                console.log(`✅ Found variable: metricId=${metricId}, variableId=${variableId}, symbol=${symbol}`);
                break;
              }
            }
          }
          
          if (variableId === 0) {
            console.warn(`⚠️ Ignorando variable inválida: metricId=${metricId}, symbol=${symbol} (ID no existe en allMetrics)`);
            return null; // Filtrar esta variable inválida
          }
          
          return {
            eval_metric_id: metricId, // CRÍTICO: usar eval_metric_id
            variable_id: variableId,
            symbol,
            value: parseFloat(value.toString()) || 0 // Enviar como número
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null && item.variable_id > 0);

      // Paso 1: Enviar los datos
      console.log('📤 Enviando datos al backend...', {
        evaluationId: currentEvaluationForModal.id,
        variablesCount: variablesToSubmit.length
      });
      await submitEvaluationData(currentEvaluationForModal.id, variablesToSubmit);

      // Paso 2: SIEMPRE finalizar la evaluación individual primero
      console.log('🎯 Finalizando evaluación individual...');
      await finalizeEvaluation(currentEvaluationForModal.id);
      console.log('✅ Evaluación finalizada exitosamente');
      
      // Marcar evaluación como finalizada
      setFinalizedEvaluations(prev => new Set([...prev, currentEvaluationForModal.id]));

      // Paso 3: Si es la última evaluación, finalizar proyecto completo
      if (isFinalizingProject) {
        console.log('🏁 Finalizando proyecto completo (última evaluación)...');
        await finalizeProject(projectId);
        
        console.log('✅ Proyecto finalizado. Redirigiendo a resultados...');
        
        // Limpiar localStorage
        localStorage.removeItem(`data-entry-project-${projectId}`);
        
        // Navegar a resultados del proyecto
        router.push(`/results/project/${projectId}/report`);
      } else {
        // Avanzar a la siguiente evaluación si existe
        const currentEvalIndex = evaluations.findIndex(e => e.id === currentEvaluationForModal.id);
        if (currentEvalIndex < evaluations.length - 1) {
          console.log('➡️ Avanzando a la siguiente evaluación...');
          // Encontrar la primera métrica de la siguiente evaluación
          const nextEval = evaluations[currentEvalIndex + 1];
          const nextMetricIndex = allMetrics.findIndex(metric =>
            (nextEval.evaluation_criteria || []).some(ec =>
              ec.criterion?.subcriteria?.some(sc =>
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
    } catch (error) {
      console.error('❌ Error durante la finalización:', error);
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
                onPrevious={async () => {
                  if (currentMetricIndex > 0) {
                    await saveCurrentMetricData();
                    setCurrentMetricIndex(currentMetricIndex - 1);
                  }
                }}
                onNext={async () => {
                  if (currentMetricIndex < allMetrics.length - 1) {
                    await saveCurrentMetricData();
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
      {currentEvaluationForModal && (() => {
        // Obtener solo las métricas de la evaluación actual
        const currentEvalMetrics: Metric[] = [];
        for (const evalCriterion of currentEvaluationForModal.evaluation_criteria || []) {
          if (evalCriterion.criterion?.subcriteria) {
            for (const subcriterion of evalCriterion.criterion.subcriteria) {
              if (subcriterion.metrics) {
                currentEvalMetrics.push(...subcriterion.metrics);
              }
            }
          }
        }

        return (
          <EvaluationCompleteModal
            isOpen={isModalOpen}
            evaluationName={currentEvaluationForModal.standard.name}
            isLastEvaluation={isFinalizingProject}
            completedMetrics={currentEvalMetrics.filter(metric => {
              const metricVariables = metric.variables || [];
              if (metricVariables.length === 0) return true;
              return metricVariables.every(v => {
                const key = `metric-${metric.id}-${v.symbol}`;
                const value = variableValues[key];
                return value !== undefined && value !== null && value !== '';
              });
            }).length}
            totalMetrics={currentEvalMetrics.length}
            variables={currentEvalMetrics.flatMap(metric => 
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
        );
      })()}
    </div>
  );
}
