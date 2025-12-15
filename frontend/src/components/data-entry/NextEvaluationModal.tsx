'use client';

import styles from './NextEvaluationModal.module.css';

interface NextEvaluationModalProps {
  isOpen: boolean;
  currentEvaluationName: string;
  nextEvaluationName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function NextEvaluationModal({
  isOpen,
  currentEvaluationName,
  nextEvaluationName,
  onConfirm,
  onCancel
}: NextEvaluationModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Icon */}
        <div className={styles.iconContainer}>
          <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Content */}
        <h2 className={styles.title}>¡Evaluación Completada!</h2>
        <p className={styles.message}>
          Has finalizado con éxito la evaluación de <strong>{currentEvaluationName}</strong>.
        </p>
        
        {/* Warning Box */}
        <div className={styles.warningBox}>
          <svg className={styles.warningIcon} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className={styles.warningText}>
            <p className={styles.warningTitle}>No podrás editar los datos ingresados</p>
            <p className={styles.warningDescription}>
              Una vez que continúes a la siguiente evaluación, no podrás regresar a modificar esta.
            </p>
          </div>
        </div>

        <p className={styles.nextEvaluation}>
          Siguiente: <strong>{nextEvaluationName}</strong>
        </p>

        {/* Buttons */}
        <div className={styles.buttons}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Revisar datos
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
