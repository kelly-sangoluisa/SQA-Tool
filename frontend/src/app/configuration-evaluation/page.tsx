'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import {
  EvaluationInfoForm,
  StandardSelection,
  CriteriaOnlySelection,
  SubCriteriaSelection,
  MetricsSelection,
  CriteriaWithImportance,
} from '@/components/configurationEvaluation';
import { Standard, Criterion } from '@/api/parameterization/parameterization-api';
import { configEvaluationApi } from '@/api/config-evaluation/config-evaluation-api';
import {
  EvaluationInfo,
  SelectedCriterion,
  ImportanceLevel,
} from '@/types/configurationEvaluation.types';
import styles from './page.module.css';
import Stepper from '@/components/shared/Stepper';
import SuccessModal from '@/components/shared/SuccessModal';

export default function ConfigurationEvaluationPage() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Store data from each step
  const [evaluationInfo, setEvaluationInfo] = useState<EvaluationInfo | null>(null);
  const [existingProjectId, setExistingProjectId] = useState<number | null>(null);
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null);
  const [selectedCriteriaIds, setSelectedCriteriaIds] = useState<number[]>([]);
  const [selectedCriteriaFull, setSelectedCriteriaFull] = useState<Criterion[]>([]);
  const [selectedSubCriteria, setSelectedSubCriteria] = useState<SelectedCriterion[]>([]);

  // Store criteria importance data
  interface CriteriaImportanceData {
    criterionId: number;
    importanceLevel: ImportanceLevel;
    importancePercentage: number;
  }
  const [criteriaImportance, setCriteriaImportance] = useState<CriteriaImportanceData[]>([]);

  interface EvaluationCriterionData {
    id: number;
    criterionId: number;
    criterionName: string;
  }
  const [createdEvaluationCriteria, setCreatedEvaluationCriteria] = useState<EvaluationCriterionData[]>([]);

  // Auth protection
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    // Solo evaluadores pueden acceder a configuración de evaluaciones
    if (!isLoading && user && user.role?.name === 'admin') {
      router.push('/parameterization');
      return;
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    // Verificar autenticación
  }, [isLoading, isAuthenticated, user]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const handleStep1Complete = (data: EvaluationInfo, projectId?: number) => {
    setEvaluationInfo(data);
    setExistingProjectId(projectId || null);
    setCurrentStep(2);
  };

  const handleStep2Complete = async (standard: Standard) => {
    // Si es un proyecto existente, validar que no tenga ya una evaluación con este estándar
    // Solo validamos evaluaciones que NO están completadas
    if (existingProjectId) {
      try {
        const evaluations = await configEvaluationApi.getEvaluationsByProjectId(existingProjectId);
        // Filtrar solo evaluaciones que no están completadas
        const activeEvaluations = evaluations.filter(evaluation => evaluation.status !== 'completed');
        const hasStandard = activeEvaluations.some(evaluation => evaluation.standard_id === standard.id);

        if (hasStandard) {
          setSaveError(`El proyecto ya tiene una evaluación activa con el estándar "${standard.name}". Por favor, seleccione otro estándar o cree un proyecto nuevo.`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      } catch (error) {
        console.error('Error validating standard:', error);
      }
    }

    setSaveError(null);
    setSelectedStandard(standard);
    setCurrentStep(3);
  };

  const handleStep3Complete = (criteriaWithImportance: CriteriaWithImportance[]) => {
    // Guardar los criterios seleccionados con importancia
    setSelectedCriteriaIds(criteriaWithImportance.map(c => c.criterionId));
    setSelectedCriteriaFull(criteriaWithImportance.map(c => c.criterion));
    setCriteriaImportance(criteriaWithImportance.map(c => ({
      criterionId: c.criterionId,
      importanceLevel: c.importanceLevel,
      importancePercentage: c.importancePercentage,
    })));
    
    // Avanzar al paso 4
    setCurrentStep(4);
  };

  const handleStep4Complete = async (subCriteria: SelectedCriterion[]) => {
    // Prevenir múltiples envíos
    if (isSaving) {
      console.warn('Ya se está guardando la evaluación, ignorando solicitud duplicada');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      setSelectedSubCriteria(subCriteria);

      if (!user) {
        throw new Error('Usuario no encontrado. Por favor, recarga la página e inicia sesión nuevamente.');
      }

      if (!user.id) {
        throw new Error(`Usuario autenticado pero sin ID. Datos del usuario: ${JSON.stringify(user)}`);
      }

      // Validar que hay criterios con importancia
      if (!criteriaImportance || criteriaImportance.length === 0) {
        throw new Error('No se han seleccionado criterios con importancia. Por favor, regrese al paso anterior y configure la importancia de los criterios.');
      }

      // Validar que el estándar está seleccionado
      if (!selectedStandard || !selectedStandard.id) {
        throw new Error('No se ha seleccionado un estándar. Por favor, regrese al paso de selección de estándar.');
      }

      if (existingProjectId) {
        const result = await configEvaluationApi.createEvaluationForExistingProject({
          projectId: existingProjectId,
          standardId: selectedStandard.id,
          criteria: criteriaImportance.map((item) => ({
            criterionId: item.criterionId,
            importanceLevel: item.importanceLevel,
            importancePercentage: item.importancePercentage,
          })),
        });

        const evaluationCriteria: EvaluationCriterionData[] = result.criteria.map((criterion) => {
          const criterionInfo = selectedCriteriaFull.find(c => c.id === criterion.criterion_id);
          return {
            id: criterion.id,
            criterionId: criterion.criterion_id,
            criterionName: criterionInfo?.name || '',
          };
        });
        setCreatedEvaluationCriteria(evaluationCriteria);
      } else {
        const result = await configEvaluationApi.completeEvaluationConfiguration({
          projectName: evaluationInfo!.name,
          projectDescription: evaluationInfo!.description,
          minQualityThreshold: evaluationInfo!.minQualityThreshold,
          standardId: selectedStandard!.id,
          creatorUserId: user.id,
          criteria: criteriaImportance.map((item) => ({
            criterionId: item.criterionId,
            importanceLevel: item.importanceLevel,
            importancePercentage: item.importancePercentage,
          })),
        });

        const evaluationCriteria: EvaluationCriterionData[] = result.criteria.map((criterion) => {
          const criterionInfo = selectedCriteriaFull.find(c => c.id === criterion.criterion_id);
          return {
            id: criterion.id,
            criterionId: criterion.criterion_id,
            criterionName: criterionInfo?.name || '',
          };
        });
        setCreatedEvaluationCriteria(evaluationCriteria);
      }

      setCurrentStep(5);
    } catch (error) {
      console.error('Error al crear la evaluación:', error);
      let errorMessage = 'Error desconocido al guardar la evaluación';

      if (error instanceof Error) {
        errorMessage = error.message;

        // Si es un error interno del servidor, dar más contexto
        if (errorMessage.includes('Internal server error')) {
          errorMessage = 'Error interno del servidor al crear la evaluación. Por favor:\n' +
            '1. Verifique que no existe ya una evaluación para este proyecto con el mismo estándar\n' +
            '2. Verifique que todos los criterios seleccionados existen en el sistema\n' +
            '3. Si el problema persiste, contacte al administrador del sistema';
        }
      }

      setSaveError(errorMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStep5Complete = async (selectedMetrics: Map<number, number[]>) => {
    // Prevenir múltiples envíos
    if (isSaving) {
      console.warn('Ya se está guardando las métricas, ignorando solicitud duplicada');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const metricsToCreate = Array.from(selectedMetrics.entries()).flatMap(([evaluationCriterionId, metricIds]) =>
        metricIds.map(metricId => ({
          eval_criterion_id: evaluationCriterionId,
          metric_id: metricId,
        }))
      );

      await configEvaluationApi.bulkCreateEvaluationMetrics({
        metrics: metricsToCreate,
      });

      setSuccessMessage(`¡Evaluación creada exitosamente!\n\nSe ha configurado la evaluación con ${createdEvaluationCriteria.length} ${createdEvaluationCriteria.length === 1 ? 'criterio' : 'criterios'} y ${metricsToCreate.length} ${metricsToCreate.length === 1 ? 'métrica' : 'métricas'}.`);
      setSuccessModalOpen(true);
    } catch (error) {
      console.error('Error al guardar las métricas:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar las métricas';
      setSaveError(errorMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = (targetStep: number) => {
    setCurrentStep(targetStep);
  };

  const getStepStatus = (step: number): 'in_progress' | 'completed' | 'cancelled' => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'in_progress';
    return 'cancelled';
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Stepper (shared component) */}
        <Stepper currentStep={currentStep} />

        {/* Content */}
        <div className={styles.content}>
          {saveError && (
            <div style={{ 
              padding: '1rem', 
              marginBottom: '1rem', 
              backgroundColor: '#fee', 
              color: '#c00',
              borderRadius: '8px',
              border: '1px solid #fcc'
            }}>
              <strong>Error:</strong> {saveError}
            </div>
          )}
          
          {isSaving && (
            <div style={{ 
              padding: '1rem', 
              marginBottom: '1rem', 
              backgroundColor: '#e3f2fd', 
              color: '#1976d2',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              Guardando configuración de evaluación...
            </div>
          )}

          {currentStep === 1 && (
            <EvaluationInfoForm
              initialData={evaluationInfo || undefined}
              onNext={handleStep1Complete}
            />
          )}

          {currentStep === 2 && (
            <StandardSelection
              initialSelectedId={selectedStandard?.id}
              onNext={handleStep2Complete}
              onBack={() => handleBack(1)}
            />
          )}

          {currentStep === 3 && selectedStandard && (
            <CriteriaOnlySelection
              standardId={selectedStandard.id}
              initialSelectedIds={selectedCriteriaIds}
              onNext={handleStep3Complete}
              onBack={() => handleBack(2)}
            />
          )}

          {currentStep === 4 && selectedCriteriaFull.length > 0 && (
            <SubCriteriaSelection
              selectedCriteria={selectedCriteriaFull}
              initialSelected={selectedSubCriteria}
              onNext={handleStep4Complete}
              onBack={() => handleBack(3)}
            />
          )}

          {currentStep === 5 && createdEvaluationCriteria.length > 0 && (
            <MetricsSelection
              evaluationCriteria={createdEvaluationCriteria}
              selectedSubCriteria={selectedSubCriteria}
              onNext={handleStep5Complete}
              onBack={() => handleBack(4)}
            />
          )}
        </div>
        {/* Success modal shown after configuration completes */}
        <SuccessModal
          open={successModalOpen}
          title="Evaluación creada"
          message={successMessage}
          onClose={() => {
            setSuccessModalOpen(false);
            router.push('/dashboard');
          }}
        />
      </div>
    </div>
  );
}
