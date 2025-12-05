import React, { useState, useEffect } from 'react';
import { Criterion, parameterizationApi, CreateCriterionDto, UpdateCriterionDto } from '../../api/parameterization/parameterization-api';
import styles from './CriterionFormDrawer.module.css';

interface CriterionFormDrawerProps {
  criterion?: Criterion | null;
  standardId?: number;
  onClose: () => void;
  onSave: (savedCriterion?: Criterion) => void;
}

interface FormData {
  name: string;
  description: string;
}

export function CriterionFormDrawer({ criterion, standardId, onClose, onSave }: CriterionFormDrawerProps) {
  const [formData, setFormData] = useState<FormData>({
    name: criterion?.name || '',
    description: criterion?.description || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar nombre (requerido)
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres';
    }

    // Validar descripción (opcional pero con límites)
    if (formData.description.trim() && formData.description.trim().length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let savedCriterion: Criterion;
      
      if (criterion) {
        // Update existing criterion
        const updateData: UpdateCriterionDto = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined
        };
        
        savedCriterion = await parameterizationApi.updateCriterion(criterion.id, updateData);
      } else {
        // Create new criterion
        if (!standardId) {
          setErrors({ general: 'Error: Se requiere un ID de estándar para crear un criterio' });
          return;
        }
        
        const createData: CreateCriterionDto = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          standard_id: standardId
        };
        
        console.log('Creating criterion with data:', createData);
        console.log('StandardId provided:', standardId);
        savedCriterion = await parameterizationApi.createCriterion(createData);
      }
      
      onSave(savedCriterion);
    } catch (error) {
      console.error('Error saving criterion:', error);
      
      let errorMessage = criterion ? 'Error al actualizar el criterio' : 'Error al crear el criterio';
      
      if (error instanceof Error) {
        if (error.message.includes('name')) {
          errorMessage = 'Error: El nombre del criterio ya existe o es inválido';
        } else if (error.message.includes('description')) {
          errorMessage = 'Error: La descripción es muy larga';
        } else if (error.message.includes('Internal server error')) {
          errorMessage = 'Error del servidor. Verifica que todos los campos sean válidos.';
        } else {
          errorMessage = `${errorMessage}: ${error.message}`;
        }
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}>
      <div className={`${styles.drawer} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {criterion ? 'Editar Criterio' : 'Nuevo Criterio'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className={styles.closeButton}
            aria-label="Cerrar"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.content}>
            {errors.general && (
              <div className={styles.errorMessage}>
                {errors.general}
              </div>
            )}

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Información del Criterio</h3>
              
              <div className={styles.field}>
                <label htmlFor="name" className={styles.label}>
                  Nombre *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`${styles.input} ${errors.name ? styles.error : ''}`}
                  placeholder="Ej: Confiabilidad del Software"
                />
                {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
              </div>

              <div className={styles.field}>
                <label htmlFor="description" className={styles.label}>
                  Descripción
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={styles.textarea}
                  rows={4}
                  placeholder="Describe qué evalúa este criterio..."
                />
                {errors.description && <span className={styles.fieldError}>{errors.description}</span>}
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.cancelButton}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={styles.saveButton}
            >
              {loading ? (
                <div className={styles.loadingContent}>
                  <div className={styles.spinner}></div>
                  <span>Guardando...</span>
                </div>
              ) : (
                criterion ? 'Actualizar Criterio' : 'Crear Criterio'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}