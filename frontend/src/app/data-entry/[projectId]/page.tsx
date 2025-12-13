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

        // **DATOS MOCK TEMPORALES** - Reemplazar cuando backend esté listo
        // Helper para crear estructura base de evaluación
        const createMockEvaluation = (
          id: number, 
          standardId: number, 
          standardName: string, 
          standardVersion: string,
          criteriaData: Array<{
            id: number;
            criterionId: number;
            name: string;
            description: string;
            importance: string;
            percentage: number;
            subcriteriaData: Array<{
              id: number;
              name: string;
              description: string;
              metricsData: Array<{
                id: number;
                name: string;
                description: string;
                formula: string;
                variables: Array<{ symbol: string; description: string; id: number }>;
              }>;
            }>;
          }>
        ) => ({
          id,
          project_id: 4,
          standard_id: standardId,
          creation_date: '2025-11-30T04:55:23.514Z',
          status: 'in_progress' as const,
          standard: { id: standardId, name: standardName, version: standardVersion },
          evaluation_criteria: criteriaData.map(c => ({
            id: c.id,
            evaluation_id: id,
            criterion_id: c.criterionId,
            importance_level: c.importance,
            importance_percentage: c.percentage,
            criterion: {
              id: c.criterionId,
              name: c.name,
              description: c.description,
              subcriteria: c.subcriteriaData.map(sc => ({
                id: sc.id,
                name: sc.name,
                description: sc.description,
                criterion_id: c.criterionId,
                state: 'active',
                created_at: '2025-11-30T04:22:45.217Z',
                updated_at: '2025-11-30T04:22:45.217Z',
                metrics: sc.metricsData.map(m => ({
                  id: m.id,
                  name: m.name,
                  description: m.description,
                  formula: m.formula,
                  variables: m.variables.map((v, idx) => ({
                    id: v.id,
                    metric_id: m.id,
                    symbol: v.symbol,
                    description: v.description,
                    state: 'active'
                  }))
                }))
              }))
            }
          }))
        });

        const mockEvaluationsWithMetrics = [
          createMockEvaluation(6, 2, 'OWASP ASVS', '4.0.3', [
            {
              id: 8, criterionId: 4, name: 'V2: Autenticación',
              description: 'Verificación de mecanismos de autenticación',
              importance: 'A', percentage: 50.00,
              subcriteriaData: [{
                id: 10, name: 'Gestión de Contraseñas',
                description: 'Políticas y gestión segura de contraseñas',
                metricsData: [
                  {
                    id: 20, name: 'Complejidad de Contraseña',
                    description: 'Evalúa el nivel de complejidad requerido',
                    formula: '(U + L + N + S) / 4',
                    variables: [
                      { id: 40, symbol: 'U', description: 'Letras mayúsculas requeridas' },
                      { id: 41, symbol: 'L', description: 'Letras minúsculas requeridas' },
                      { id: 42, symbol: 'N', description: 'Números requeridos' },
                      { id: 43, symbol: 'S', description: 'Símbolos especiales requeridos' }
                    ]
                  },
                  {
                    id: 21, name: 'Tiempo de Expiración',
                    description: 'Tiempo máximo de validez de una contraseña',
                    formula: 'T / D',
                    variables: [
                      { id: 44, symbol: 'T', description: 'Tiempo actual de la contraseña (días)' },
                      { id: 45, symbol: 'D', description: 'Días máximos permitidos' }
                    ]
                  }
                ]
              }]
            },
            {
              id: 9, criterionId: 5, name: 'V4: Control de Acceso',
              description: 'Verificación de controles de acceso',
              importance: 'A', percentage: 50.00,
              subcriteriaData: [{
                id: 11, name: 'Autorización de Recursos',
                description: 'Control de acceso a recursos del sistema',
                metricsData: [{
                  id: 22, name: 'Porcentaje de Recursos Protegidos',
                  description: 'Porcentaje de recursos que requieren autorización',
                  formula: 'RP / TR * 100',
                  variables: [
                    { id: 46, symbol: 'RP', description: 'Recursos protegidos' },
                    { id: 47, symbol: 'TR', description: 'Total de recursos' }
                  ]
                }]
              }]
            }
          ]),
          createMockEvaluation(5, 1, 'ISO/IEC 25010', '2023', [
            {
              id: 6, criterionId: 1, name: 'Adecuación funcional',
              description: 'Capacidad del producto software para proporcionar funciones',
              importance: 'A', percentage: 70.00,
              subcriteriaData: [{
                id: 12, name: 'Completitud Funcional',
                description: 'Grado en que el conjunto de funciones cubre todas las tareas',
                metricsData: [{
                  id: 23, name: 'Cobertura de Requisitos',
                  description: 'Porcentaje de requisitos funcionales implementados',
                  formula: 'RF / TR * 100',
                  variables: [
                    { id: 48, symbol: 'RF', description: 'Requisitos funcionales implementados' },
                    { id: 49, symbol: 'TR', description: 'Total de requisitos' }
                  ]
                }]
              }]
            },
            {
              id: 7, criterionId: 2, name: 'Usabilidad',
              description: 'Capacidad del producto software para ser entendido',
              importance: 'M', percentage: 30.00,
              subcriteriaData: [{
                id: 13, name: 'Aprendizaje',
                description: 'Capacidad del usuario para aprender a usar el software',
                metricsData: [{
                  id: 24, name: 'Tiempo de Aprendizaje',
                  description: 'Tiempo promedio que tarda un usuario en aprender',
                  formula: 'T / N',
                  variables: [
                    { id: 50, symbol: 'T', description: 'Tiempo total de aprendizaje (minutos)' },
                    { id: 51, symbol: 'N', description: 'Número de usuarios' }
                  ]
                }]
              }]
            }
          ])
        ];

        setEvaluations(mockEvaluationsWithMetrics);
        
        // Cargar progreso del proyecto (puede usar datos reales o mock)
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
            total_evaluations: 2,
            completed_evaluations: 0,
            in_progress_evaluations: 2,
            total_metrics: 4,
            completed_metrics: 0,
            overall_progress_percentage: 0
          };
          setProjectProgress(mockProgress);
        }

        // Procesar métricas de todas las evaluaciones mock
        const metrics: Metric[] = [];
        for (const evaluation of mockEvaluationsWithMetrics) {
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
