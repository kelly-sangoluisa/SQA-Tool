'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import {
  EvaluationInfoForm,
  StandardSelection,
  CriteriaOnlySelection,
  SubCriteriaSelection,
} from '@/components/configurationEvaluation';
import { Standard, Criterion } from '@/api/parameterization/parameterization-api';
import {
  EvaluationInfo,
  SelectedCriterion,
  EvaluationConfiguration,
} from '@/types/configurationEvaluation.types';
import styles from './page.module.css';

export default function ConfigurationEvaluationPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Store data from each step
  const [evaluationInfo, setEvaluationInfo] = useState<EvaluationInfo | null>(null);
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null);
  const [selectedCriteriaIds, setSelectedCriteriaIds] = useState<number[]>([]);
  const [selectedCriteriaFull, setSelectedCriteriaFull] = useState<Criterion[]>([]);
  const [selectedSubCriteria, setSelectedSubCriteria] = useState<SelectedCriterion[]>([]);

  // Auth protection
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Don't render until auth is checked
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

  const handleStep3Complete = (criteriaIds: number[], criteriaFull: Criterion[]) => {
    setSelectedCriteriaIds(criteriaIds);
    setSelectedCriteriaFull(criteriaFull);
    setCurrentStep(4);
  };

  const handleStep4Complete = (subCriteria: SelectedCriterion[]) => {
    setSelectedSubCriteria(subCriteria);

    // Create final configuration object
    const configuration: EvaluationConfiguration = {
      info: evaluationInfo!,
      standardId: selectedStandard!.id,
      standardName: selectedStandard!.name,
      standardVersion: selectedStandard!.version,
      selectedCriteria: subCriteria,
    };

    // TODO: Save configuration to backend or local storage
    console.log('Evaluation Configuration:', configuration);

    // Show success message and redirect
    alert('Configuración de evaluación completada exitosamente!');
    router.push('/dashboard');
  };

  const handleBack = (targetStep: number) => {
    setCurrentStep(targetStep);
  };

  const getStepStatus = (step: number): 'completed' | 'active' | 'pending' => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'active';
    return 'pending';
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
