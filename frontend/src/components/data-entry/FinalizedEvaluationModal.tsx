'use client';

import type { FinalizedEvaluationModalProps } from '@/types/data-entry/data-entry-modal.types';
import styles from './FinalizedEvaluationModal.module.css';

export function FinalizedEvaluationModal({
  isOpen,
  onClose
}: FinalizedEvaluationModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Icon */}
        <div className={styles.iconContainer}>
          <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Content */}
        <h2 className={styles.title}>Evaluación Finalizada</h2>
        <p className={styles.message}>
          Esta evaluación ya ha sido completada y no puede ser editada.
        </p>
        <p className={styles.submessage}>
          Los datos ya fueron procesados y guardados en el sistema.
        </p>

        {/* Button */}
        <button className={styles.button} onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  );
}
