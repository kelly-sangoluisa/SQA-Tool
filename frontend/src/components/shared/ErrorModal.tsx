import { useEffect, useRef } from 'react';
import styles from './ErrorModal.module.css';

interface ErrorModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  details?: string;
  onClose: () => void;
}

export function ErrorModal({ isOpen, title, message, details, onClose }: ErrorModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Manejar apertura/cierre del dialog nativo
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Soporte para tecla Escape y click en backdrop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };

    const handleClick = (event: MouseEvent) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      
      if (!isInDialog) {
        onClose();
      }
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('click', handleClick);

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('click', handleClick);
    };
  }, [onClose]);

  return (
    <dialog 
      ref={dialogRef}
      className={styles.modal}
      aria-labelledby="error-modal-title"
      aria-describedby="error-modal-message"
    >
      <div className={styles.header}>
        <svg 
          width="48" 
          height="48" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#ef4444" 
          strokeWidth="2"
          className={styles.icon}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3 id="error-modal-title" className={styles.title}>{title}</h3>
      </div>
      
      <p id="error-modal-message" className={styles.message}>{message}</p>
      
      {details && (
        <p className={styles.details}>{details}</p>
      )}
      
      <div className={styles.footer}>
        <button 
          onClick={onClose} 
          className={styles.closeButton}
          type="button"
          aria-label="Cerrar modal de error"
        >
          Cerrar
        </button>
      </div>
    </dialog>
  );
}
