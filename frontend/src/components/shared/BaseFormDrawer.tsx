import React, { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import styles from './FormDrawer.module.css';

interface BaseFormDrawerProps {
  readonly isVisible: boolean;
  readonly title: string;
  readonly subtitle: string;
  readonly onClose: () => void;
  readonly onSubmit: (e: React.FormEvent) => void;
  readonly loading: boolean;
  readonly submitLabel: string;
  readonly submitDisabled: boolean;
  readonly generalError?: string;
  readonly children: ReactNode;
}

export function BaseFormDrawer({
  isVisible,
  title,
  subtitle,
  onClose,
  onSubmit,
  loading,
  submitLabel,
  submitDisabled,
  generalError,
  children
}: BaseFormDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Bloquear scroll del body cuando el drawer está visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  const drawerContent = (
    <div className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}>
      <div className={`${styles.drawer} ${isVisible ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Cerrar formulario"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className={`${styles.form} ${loading ? styles.loading : ''}`}>
          <div className={styles.content}>
            {generalError && (
              <div className={styles.errorMessage}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 1L15 15H1L8 1Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 6V8.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
                </svg>
                {generalError}
              </div>
            )}

            {children}
          </div>

          <div className={styles.footer}>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              disabled={submitDisabled}
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  // Renderizar en el body usando Portal para escapar del contenedor "shifted"
  return mounted ? createPortal(drawerContent, document.body) : null;
}
