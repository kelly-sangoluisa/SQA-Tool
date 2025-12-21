import React from 'react';
import styles from './AdminParameterization.module.css';

interface EmptyStateProps {
  readonly title: string;
  readonly description: string;
  readonly buttonText?: string;
  readonly onButtonClick?: () => void;
  readonly icon?: string;
}

export function EmptyState({ 
  title, 
  description, 
  buttonText, 
  onButtonClick, 
  icon = '📊' 
}: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {buttonText && onButtonClick && (
        <button className={styles.emptyButton} onClick={onButtonClick}>
          {buttonText}
        </button>
      )}
    </div>
  );
}
