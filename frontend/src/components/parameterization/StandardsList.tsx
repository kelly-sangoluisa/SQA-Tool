import React from 'react';
import { Standard } from '../../api/parameterization/parameterization-api';
import { StandardCard } from './StandardCard';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import styles from './AdminParameterization.module.css';

interface StandardsListProps {
  standards: Standard[];
  loading: boolean;
  onStandardSelect: (standard: Standard) => void;
  onEditStandard: (standard: Standard, e: React.MouseEvent) => void;
  onToggleStandardState: (standard: Standard) => void;
  onCreateStandard: () => void;
}

export function StandardsList({ 
  standards, 
  loading, 
  onStandardSelect, 
  onEditStandard, 
  onToggleStandardState,
  onCreateStandard 
}: StandardsListProps) {
  if (loading) {
    return <LoadingSpinner message="Cargando estándares..." />;
  }

  if (!loading && standards.length === 0) {
    return (
      <EmptyState 
        title="No hay estándares definidos"
        description="Comienza creando el primer estándar de calidad para tu organización."
        buttonText="Crear Primer Estándar"
        onButtonClick={onCreateStandard}
      />
    );
  }

  return (
    <div className={styles.standardsGrid}>
      {standards.map((standard) => (
        <StandardCard
          key={standard.id}
          standard={standard}
          onSelect={onStandardSelect}
          onEdit={onEditStandard}
          onToggleState={onToggleStandardState}
        />
      ))}
    </div>
  );
}
