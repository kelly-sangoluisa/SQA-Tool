'use client';

import type { NextEvaluationModalProps } from '@/types/data-entry/data-entry-modal.types';
import styles from './NextEvaluationModal.module.css';

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
        <h2 className={styles.title}>¡Evaluación Completada con Éxito!</h2>
        <p className={styles.message}>
          La evaluación de <strong>{currentEvaluationName}</strong> ha sido finalizada y guardada correctamente.
        </p>
        
        {/* Warning Box */}
        <div className={styles.warningBox}>
          <svg className={styles.warningIcon} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className={styles.warningText}>
            <p className={styles.warningTitle}>📌 Importante</p>
            <p className={styles.warningDescription}>
              Esta evaluación ya está completa. Los datos están guardados y <strong>no se pueden modificar</strong>.
            </p>
          </div>
        </div>

        <p className={styles.nextEvaluation}>
          A continuación: <strong>{nextEvaluationName}</strong>
        </p>

        {/* Buttons */}
        <div className={styles.buttons}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Ver resumen
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            Continuar a siguiente evaluación
          </button>
        </div>
      </div>
    </div>
  );
}
