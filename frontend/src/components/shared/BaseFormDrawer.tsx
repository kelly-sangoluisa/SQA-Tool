import React, { ReactNode } from 'react';
import { Button } from './Button';
import styles from './FormDrawer.module.css';

interface BaseFormDrawerProps {
  isVisible: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  submitLabel: string;
  submitDisabled: boolean;
  generalError?: string;
  children: ReactNode;
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
  return (
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
}
