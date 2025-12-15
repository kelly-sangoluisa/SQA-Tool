import React from 'react';
import styles from './SuccessModal.module.css';

type Props = {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
};

export default function SuccessModal({ open, title = 'Operación exitosa', message, onClose }: Props) {
  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.iconContainer}>
          <svg className={styles.successIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button onClick={onClose} className={styles.button}>Aceptar</button>
        </div>
      </div>
    </div>
  );
}
