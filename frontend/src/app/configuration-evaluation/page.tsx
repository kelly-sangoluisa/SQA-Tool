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

export default function ConfigurationEvaluationPage() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Store data from each step
  const [evaluationInfo, setEvaluationInfo] = useState<EvaluationInfo | null>(null);
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

  const handleStep1Complete = (data: EvaluationInfo) => {
    setEvaluationInfo(data);
    setCurrentStep(2);
  };

  const handleStep2Complete = (standard: Standard) => {
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

      // Llamar a las APIs en orden:
      // 1. POST /config-evaluation/projects (retorna project.id)
      // 2. POST /config-evaluation/evaluations (usa project.id, retorna evaluation.id)
      // 3. POST /config-evaluation/evaluation-criteria/bulk (usa evaluation.id)
      const result = await configEvaluationApi.completeEvaluationConfiguration({
        projectName: evaluationInfo!.name,
        projectDescription: evaluationInfo!.description,
        standardId: selectedStandard!.id,
        creatorUserId: user.id,
        criteria: criteriaImportance.map((item) => ({
          criterionId: item.criterionId,
          importanceLevel: item.importanceLevel,
          importancePercentage: item.importancePercentage,
        })),
      });

      // Create final configuration object (currently not used but kept for future reference)
      // const configuration: EvaluationConfiguration = {
      //   info: evaluationInfo!,
      //   standardId: selectedStandard!.id,
      //   standardName: selectedStandard!.name,
      //   standardVersion: selectedStandard!.version,
      //   selectedCriteria: subCriteria,
      // };

      // Mostrar mensaje de éxito y redirigir
      alert(`¡Configuración de evaluación completada exitosamente!
      
Proyecto ID: ${result.project.id}
Evaluación ID: ${result.evaluation.id}
Criterios creados: ${result.criteria.length}`);
      
      router.push('/dashboard');
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
        {/* Stepper */}
        <div className={styles.stepper}>
          <div className={styles.stepperInner}>
            {/* Step 1 */}
            <div className={styles.stepItem}>
              <div
                className={`${styles.stepCircle} ${styles[getStepStatus(1)]}`}
              >
                {getStepStatus(1) === 'completed' ? (
                  <svg
                    className={styles.checkIcon}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span>1</span>
                )}
              </div>
              <div className={styles.stepContent}>
                <p className={styles.stepLabel}>Paso 1</p>
                <p className={styles.stepTitle}>Información</p>
              </div>
            </div>

            {/* Divider */}
            <div
              className={`${styles.stepDivider} ${
                currentStep > 1 ? styles.completed : ''
              }`}
            />

            {/* Step 2 */}
            <div className={styles.stepItem}>
              <div
                className={`${styles.stepCircle} ${styles[getStepStatus(2)]}`}
              >
                {getStepStatus(2) === 'completed' ? (
                  <svg
                    className={styles.checkIcon}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span>2</span>
                )}
              </div>
              <div className={styles.stepContent}>
                <p className={styles.stepLabel}>Paso 2</p>
                <p className={styles.stepTitle}>Estándar</p>
              </div>
            </div>

            {/* Divider */}
            <div
              className={`${styles.stepDivider} ${
                currentStep > 2 ? styles.completed : ''
              }`}
            />

            {/* Step 3 */}
            <div className={styles.stepItem}>
              <div
                className={`${styles.stepCircle} ${styles[getStepStatus(3)]}`}
              >
                {getStepStatus(3) === 'completed' ? (
                  <svg
                    className={styles.checkIcon}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span>3</span>
                )}
              </div>
              <div className={styles.stepContent}>
                <p className={styles.stepLabel}>Paso 3</p>
                <p className={styles.stepTitle}>Criterios</p>
              </div>
            </div>

            {/* Divider */}
            <div
              className={`${styles.stepDivider} ${
                currentStep > 3 ? styles.completed : ''
              }`}
            />

            {/* Step 4 */}
            <div className={styles.stepItem}>
              <div
                className={`${styles.stepCircle} ${styles[getStepStatus(4)]}`}
              >
                {getStepStatus(4) === 'completed' ? (
                  <svg
                    className={styles.checkIcon}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span>4</span>
                )}
              </div>
              <div className={styles.stepContent}>
                <p className={styles.stepLabel}>Paso 4</p>
                <p className={styles.stepTitle}>Subcriterios</p>
              </div>
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
}
