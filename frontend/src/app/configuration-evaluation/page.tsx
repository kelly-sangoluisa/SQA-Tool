'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import {
  EvaluationInfoForm,
  StandardSelection,
  CriteriaOnlySelection,
  SubCriteriaSelection,
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
    if (existingProjectId) {
      try {
        const evaluations = await configEvaluationApi.getEvaluationsByProjectId(existingProjectId);
        const hasStandard = evaluations.some(evaluation => evaluation.standard_id === standard.id);

        if (hasStandard) {
          setSaveError(`El proyecto ya tiene una evaluación con el estándar "${standard.name}". Por favor, seleccione otro estándar o cree un proyecto nuevo.`);
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
    try {
      setIsSaving(true);
      setSaveError(null);
      setSelectedSubCriteria(subCriteria);

      // Verificar que tenemos el usuario autenticado
      if (!user) {
        throw new Error('Usuario no encontrado. Por favor, recarga la página e inicia sesión nuevamente.');
      }

      if (!user.id) {
        throw new Error(`Usuario autenticado pero sin ID. Datos del usuario: ${JSON.stringify(user)}`);
      }

      let projectId: number;
      let evaluationId: number;
      let criteriaCount: number;

      // Decidir si crear proyecto nuevo o usar existente
      if (existingProjectId) {
        // Proyecto existente: solo crear evaluación y criterios
        const result = await configEvaluationApi.createEvaluationForExistingProject({
          projectId: existingProjectId,
          standardId: selectedStandard!.id,
          criteria: criteriaImportance.map((item) => ({
            criterionId: item.criterionId,
            importanceLevel: item.importanceLevel,
            importancePercentage: item.importancePercentage,
          })),
        });

        projectId = existingProjectId;
        evaluationId = result.evaluation.id;
        criteriaCount = result.criteria.length;
      } else {
        // Proyecto nuevo: crear proyecto, evaluación y criterios
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

        projectId = result.project.id;
        evaluationId = result.evaluation.id;
        criteriaCount = result.criteria.length;
      }

      // Mostrar mensaje de éxito y redirigir
      // Mostrar modal en vez de alert de navegador
      setSuccessMessage(`✅ ¡Evaluación creada exitosamente!\n\nSe ha configurado la evaluación con ${criteriaCount} ${criteriaCount === 1 ? 'criterio' : 'criterios'}.`);
      setSuccessModalOpen(true);
    } catch (error) {
      console.error('❌ Error al crear la evaluación:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar la evaluación';
      setSaveError(errorMessage);
      
      // Scroll hacia arriba para ver el error
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
