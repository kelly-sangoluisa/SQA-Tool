import React from 'react';
import { Standard } from '../../api/parameterization/parameterization-api';
import { StandardCard } from './StandardCard';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import styles from './AdminParameterization.module.css';

interface StandardsListProps {
  readonly standards: Standard[];
  readonly loading: boolean;
  readonly onStandardSelect: (standard: Standard) => void;
  readonly onEditStandard: (standard: Standard, e: React.MouseEvent) => void;
  readonly onToggleStandardState: (standard: Standard) => void;
  readonly onCreateStandard: () => void;
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
