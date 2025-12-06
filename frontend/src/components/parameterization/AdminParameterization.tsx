"use client";
import React, { useState } from 'react';
import { Standard } from '../../api/parameterization/parameterization-api';
import { useStandardsManagement } from '../../hooks/admin/useStandardsManagement';
import { StandardDetailView } from './StandardDetailView';
import { StandardFormDrawer } from './StandardFormDrawer';
import { AdminParameterizationHeader } from './AdminParameterizationHeader';
import { StandardsList } from './StandardsList';
import { LoadingSpinner } from './LoadingSpinner';
import styles from './AdminParameterization.module.css';

export function AdminParameterization() {
  const {
    standards,
    loading,
    authLoading,
    isAuthenticated,
    loadStandards,
    toggleStandardState,
    updateStandard,
    addStandard
  } = useStandardsManagement();
  
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStandard, setEditingStandard] = useState<Standard | null>(null);

  const handleStandardSelect = (standard: Standard) => {
    setSelectedStandard(standard);
  };

  const handleBackToStandards = () => {
    setSelectedStandard(null);
  };

  const handleCreateStandard = () => {
    setEditingStandard(null);
    setIsFormOpen(true);
  };

  const handleEditStandard = (standard: Standard, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStandard(standard);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingStandard(null);
  };

  const handleStandardSaved = (savedStandard?: Standard) => {
    // Si tenemos el estándar actualizado, usarlo para actualización optimista
    if (savedStandard) {
      if (editingStandard) {
        // Es una actualización
        updateStandard(savedStandard);
      } else {
        // Es una creación
        addStandard(savedStandard);
      }
    } else {
      // Fallback: recargar toda la lista si no tenemos el estándar
      loadStandards();
    }
    handleCloseForm();
  };

  // Show detail view if a standard is selected
  if (selectedStandard) {
    return (
      <StandardDetailView 
        standard={selectedStandard} 
        onBack={handleBackToStandards}
      />
    );
  }

  // Show loading while auth is being checked
  if (authLoading || !isAuthenticated) {
    return (
      <div className={styles.container}>
        <LoadingSpinner 
          message={authLoading ? 'Verificando autenticación...' : 'No autorizado'} 
        />
      </div>
    );
  }

  // Main view: standards management
  return (
    <div className={styles.container}>
      <AdminParameterizationHeader 
        onCreateStandard={handleCreateStandard}
        loading={loading}
      />

      <div className={styles.content}>
        <StandardsList
          standards={standards}
          loading={loading}
          onStandardSelect={handleStandardSelect}
          onEditStandard={handleEditStandard}
          onToggleStandardState={toggleStandardState}
          onCreateStandard={handleCreateStandard}
        />
      </div>
      
      {isFormOpen && (
        <StandardFormDrawer
          standard={editingStandard}
          onClose={handleCloseForm}
          onSave={handleStandardSaved}
        />
      )}
    </div>
  );
}