'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
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

function ConfigurationEvaluationPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 👉 NUEVO: modal para cancelar
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const [evaluationInfo, setEvaluationInfo] = useState<EvaluationInfo | null>(null);
  const [existingProjectId, setExistingProjectId] = useState<number | null>(null);
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null);
  const [selectedCriteriaFull, setSelectedCriteriaFull] = useState<Criterion[]>([]);
  const [selectedSubCriteria, setSelectedSubCriteria] = useState<SelectedCriterion[]>([]);

  interface CriteriaImportanceData {
    criterionId: number;
    importanceLevel: ImportanceLevel;
    importancePercentage: number;
  }

  const [criteriaImportance, setCriteriaImportance] = useState<CriteriaImportanceData[]>([]);

  // Advertencia al cerrar pestaña
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    // SOLO cuando realmente se está saliendo de la página
    if (currentStep > 1 && currentStep < 6) {
      e.preventDefault();
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [currentStep]);


  const handleStep1Complete = (data: EvaluationInfo, projectId?: number) => {
    setEvaluationInfo(data);
    setExistingProjectId(projectId || null);
    setCurrentStep(2);
  };

  const handleStep2Complete = async (standard: Standard) => {
    setSelectedStandard(standard);
    setCurrentStep(3);
  };

  const handleStep3Complete = (criteriaWithImportance: CriteriaWithImportance[]) => {
    setSelectedCriteriaFull(criteriaWithImportance.map(c => c.criterion));
    setCriteriaImportance(criteriaWithImportance.map(c => ({
      criterionId: c.criterionId,
      importanceLevel: c.importanceLevel,
      importancePercentage: c.importancePercentage,
    })));
    setCurrentStep(4);
  };

  const handleStep4Complete = (subCriteria: SelectedCriterion[]) => {
    setSelectedSubCriteria(subCriteria);
    setCurrentStep(5);
  };

const handleStep5Complete = async (selectedMetrics: Map<number, number[]>) => {
  if (isSaving) return;

  try {
    setIsSaving(true);

    if (!user?.id) throw new Error('Usuario no válido');
    if (!evaluationInfo) throw new Error('Información de evaluación faltante');
    if (!selectedStandard) throw new Error('Estándar no seleccionado');
    if (criteriaImportance.length === 0)
      throw new Error('No hay criterios configurados');

    // 🔹 Convertir métricas seleccionadas
    const metricsToCreate = Array.from(selectedMetrics.entries()).flatMap(
      ([criterionId, metricIds]) =>
        metricIds.map(metricId => ({
          criterionId,
          metricId,
        }))
    );

    if (metricsToCreate.length === 0)
      throw new Error('Debe seleccionar al menos una métrica');

    let projectId: number;

    // ✅ PROYECTO
    if (existingProjectId) {
      projectId = existingProjectId;
    } else {
      const project = await configEvaluationApi.createProject({
        name: evaluationInfo.name,
        description: evaluationInfo.description,
        minimum_threshold: evaluationInfo.minQualityThreshold,
        creator_user_id: user.id,
      });
      projectId = project.id;
    }

    // ✅ EVALUACIÓN
    const evaluation = await configEvaluationApi.createEvaluation({
      project_id: projectId,
      standard_id: selectedStandard.id,
    });

    // ✅ CRITERIOS
    const evaluationCriteria =
      await configEvaluationApi.bulkCreateEvaluationCriteria({
        criteria: criteriaImportance.map(c => ({
          evaluation_id: evaluation.id,
          criterion_id: c.criterionId,
          importance_level: c.importanceLevel,
          importance_percentage: c.importancePercentage,
        })),
      });

    // ✅ MÉTRICAS
    await configEvaluationApi.bulkCreateEvaluationMetrics({
      metrics: metricsToCreate.map(m => {
        const ec = evaluationCriteria.find(
          c => c.criterion_id === m.criterionId
        );
        if (!ec) throw new Error('Criterio no encontrado');
        return {
          eval_criterion_id: ec.id,
          metric_id: m.metricId,
        };
      }),
    });

    // ✅ ÉXITO REAL
    setSuccessMessage('¡Evaluación creada exitosamente!');
    setSuccessModalOpen(true);

  } catch (error) {
    console.error('Error al crear la evaluación:', error);
    setSuccessMessage(
      error instanceof Error ? error.message : 'Error inesperado al crear la evaluación'
    );
    setSuccessModalOpen(true);
  } finally {
    setIsSaving(false);
  }
};


  // 👉 CAMBIADO
  const handleCancelEvaluation = () => {
    setCancelModalOpen(true);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <Stepper currentStep={currentStep} />

        {currentStep > 1 && currentStep < 6 && (
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <button
              onClick={handleCancelEvaluation}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.9375rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar y volver al Dashboard
            </button>
          </div>
        )}

        <div className={styles.content}>
          {currentStep === 1 && <EvaluationInfoForm onNext={handleStep1Complete} />}
          {currentStep === 2 && <StandardSelection onNext={handleStep2Complete} onBack={() => setCurrentStep(1)} />}
          {currentStep === 3 && selectedStandard && (
            <CriteriaOnlySelection
              standardId={selectedStandard.id}
              onNext={handleStep3Complete}
              onBack={() => setCurrentStep(2)}
            />
          )}
          {currentStep === 4 && (
            <SubCriteriaSelection
              selectedCriteria={selectedCriteriaFull}
              onNext={handleStep4Complete}
              onBack={() => setCurrentStep(3)}
            />
          )}
          {currentStep === 5 && (
            <MetricsSelection
              selectedCriteria={selectedCriteriaFull}
              selectedSubCriteria={selectedSubCriteria}
              onNext={handleStep5Complete}
              onBack={() => setCurrentStep(4)}
            />
          )}
        </div>

        {/* MODAL ÉXITO */}
        <SuccessModal
          open={successModalOpen}
          title="Evaluación creada"
          message={successMessage}
          onClose={() => {
            setSuccessModalOpen(false);
            router.push('/dashboard');
          }}
        />

        {/* 👉 MODAL CANCELAR */}
        <SuccessModal
          open={cancelModalOpen}
          title="Cancelar evaluación"
          message={'¿Estás seguro?\n\nPerderás todos los datos de la evaluación.'}
          showCancelButton={true}
          confirmText="Aceptar"
          cancelText="Cancelar"
          onClose={() => {
            setCancelModalOpen(false);
            router.push('/dashboard');
          }}
          onCancel={() => setCancelModalOpen(false)}
        />

      </div>
    </div>
  );
}

export default function ConfigurationEvaluationPageWrapper() {
  return (
    <ProtectedRoute requiredRole="evaluator">
      <ConfigurationEvaluationPage />
    </ProtectedRoute>
  );
}
