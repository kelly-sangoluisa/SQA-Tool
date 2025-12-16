import React from 'react';
import { Standard } from '../../api/parameterization/parameterization-api';
import { Switch } from '../shared';
import styles from './AdminParameterization.module.css';

interface StandardCardProps {
  readonly standard: Standard;
  readonly onSelect: (standard: Standard) => void;
  readonly onEdit: (standard: Standard, e: React.MouseEvent) => void;
  readonly onToggleState: (standard: Standard) => void;
}

export function StandardCard({ standard, onSelect, onEdit, onToggleState }: StandardCardProps) {
  const handleViewDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(standard);
  };

  return (
    <div 
      key={standard.id} 
      className={styles.standardCard}
    >
      <div className={styles.cardHeader}>
        <div className={styles.titleSection}>
          <h3 className={styles.cardTitle}>{standard.name}</h3>
          <span className={styles.date}>
            {new Date(standard.created_at).toLocaleDateString()}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => onEdit(standard, e)}
          className={styles.editButton}
          title="Editar estándar"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M11.013 1.987L12.013 0.987C12.3984 0.6016 12.9496 0.3867 13.5225 0.3867C14.0954 0.3867 14.6466 0.6016 15.032 0.987C15.4174 1.3724 15.6323 1.9236 15.6323 2.4965C15.6323 3.0694 15.4174 3.6206 15.032 3.006L5.5 13.538H1V9.038L11.013 1.025V1.987Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </button>
      </div>
      
      <p className={styles.cardDescription}>
        {standard.description || 'Sin descripción disponible'}
      </p>
      
      <div className={styles.cardFooter}>
        <button 
          type="button"
          className={styles.viewButton}
          onClick={handleViewDetail}
        >
          Ver Detalle
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 12L10 8L6 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        
        <Switch
          checked={standard.state === 'active'}
          onChange={() => onToggleState(standard)}
          title={`${standard.state === 'active' ? 'Desactivar' : 'Activar'} estándar`}
        />
      </div>
    </div>
  );
}
