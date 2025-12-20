import React from 'react';
import styles from './SuccessModal.module.css';

type Props = {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  showCancelButton?: boolean;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
};

export default function SuccessModal({ 
  open, 
  title = 'Operación exitosa', 
  message, 
  onClose,
  showCancelButton = false,
  onCancel,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar'
}: Readonly<Props>) {
  if (!open) return null;

  return (
    <dialog open className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.iconContainer}>
          <svg className={styles.successIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          {showCancelButton && onCancel && (
            <button onClick={onCancel} className={styles.cancelButton}>
              {cancelText}
            </button>
          )}
          <button onClick={onClose} className={styles.button}>{confirmText}</button>
        </div>
      </div>
    </dialog>
  );
}
