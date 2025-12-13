'use client';

import React from 'react';
import styles from './AlertBanner.module.css';

type AlertType = 'error' | 'warning' | 'success' | 'info';

interface AlertBannerProps {
  type: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
  visible?: boolean;
}

export default function AlertBanner({
  type,
  title,
  message,
  onClose,
  visible = true,
}: AlertBannerProps) {
  if (!visible) return null;

  const getIcon = (type: AlertType): string => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      default:
        return '•';
    }
  };

  return (
    <div className={`${styles.banner} ${styles[type]}`} role="alert">
      <div className={styles.content}>
        <span className={styles.icon}>{getIcon(type)}</span>
        <div className={styles.text}>
          {title && <strong className={styles.title}>{title}: </strong>}
          <span className={styles.message}>{message}</span>
        </div>
      </div>
      {onClose && (
        <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar alerta">
          ×
        </button>
      )}
    </div>
  );
}
