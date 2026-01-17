import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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

// Estilos inline como fallback para garantizar que el modal funcione
const fallbackStyles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
    boxSizing: 'border-box' as const,
    margin: 0,
  },
  modal: {
    background: 'white',
    borderRadius: '20px',
    padding: '3rem 2.5rem',
    maxWidth: '480px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    textAlign: 'center' as const,
    position: 'relative' as const,
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    color: '#10b981',
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
    borderRadius: '50%',
    padding: '1rem',
    border: '3px solid rgba(16, 185, 129, 0.2)',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#1f2937',
    margin: '0 0 1rem 0',
    lineHeight: 1.3,
  },
  message: {
    fontSize: '1.0625rem',
    color: '#4b5563',
    margin: '0 0 2.5rem 0',
    whiteSpace: 'pre-wrap' as const,
    lineHeight: 1.7,
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.75rem',
  },
  cancelButton: {
    background: '#f3f4f6',
    color: '#4b5563',
    border: '2px solid #e5e7eb',
    padding: '1rem 2.5rem',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    minWidth: '140px',
  },
  button: {
    background: 'linear-gradient(135deg, #4E5EA3 0%, #59469A 100%)',
    color: 'white',
    border: 'none',
    padding: '1rem 2.5rem',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    minWidth: '140px',
  },
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Manejar tecla Escape para cerrar el modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  // Handlers para accesibilidad
  const handleOverlayKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClose();
    }
  };

  const handleModalKeyDown = (event: React.KeyboardEvent) => {
    event.stopPropagation();
  };

  // No renderizar en el servidor
  if (!mounted) return null;
  if (!open) return null;

  const modalContent = (
    <div
      className={styles.overlay}
      style={fallbackStyles.overlay}
      onClick={onClose}
      onKeyDown={handleOverlayKeyDown}
      role="button"
      tabIndex={-1}
      aria-label="Cerrar modal"
    >
      <div
        className={styles.modal}
        style={fallbackStyles.modal}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleModalKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={styles.iconContainer} style={fallbackStyles.iconContainer}>
          <svg
            className={styles.successIcon}
            style={fallbackStyles.successIcon}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 id="modal-title" className={styles.title} style={fallbackStyles.title}>{title}</h3>
        <p className={styles.message} style={fallbackStyles.message}>{message}</p>
        <div className={styles.actions} style={fallbackStyles.actions}>
          {showCancelButton && onCancel && (
            <button
              onClick={onCancel}
              className={styles.cancelButton}
              style={fallbackStyles.cancelButton}
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onClose}
            className={styles.button}
            style={fallbackStyles.button}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
