import React, { useState, useEffect } from 'react';
import { SubCriterion, parameterizationApi, CreateSubCriterionDto, UpdateSubCriterionDto } from '../../api/parameterization/parameterization-api';
import { Button } from '../shared/Button';
import styles from '../shared/FormDrawer.module.css';

interface SubCriterionFormDrawerProps {
  subCriterion?: SubCriterion | null;
  criterionId?: number;
  onClose: () => void;
  onSave: (savedSubCriterion?: SubCriterion) => void;
}

interface FormData {
  name: string;
  description: string;
}

export function SubCriterionFormDrawer({ subCriterion, criterionId, onClose, onSave }: SubCriterionFormDrawerProps) {
  const [formData, setFormData] = useState<FormData>({
    name: subCriterion?.name || '',
    description: subCriterion?.description || ''
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
      let savedSubCriterion: SubCriterion;
      
      if (subCriterion) {
        // Update existing subcriterion
        const updateData: UpdateSubCriterionDto = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined
        };
        
        savedSubCriterion = await parameterizationApi.updateSubCriterion(subCriterion.id, updateData);
      } else {
        // Create new subcriterion
        if (!criterionId) {
          throw new Error('Se requiere un ID de criterio para crear un subcriterio');
        }
        
        const createData: CreateSubCriterionDto = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          criterion_id: criterionId
        };
        
        savedSubCriterion = await parameterizationApi.createSubCriterion(createData);
      }
      
      onSave(savedSubCriterion);
    } catch (error) {
      console.error('Error saving subcriterion:', error);
      
      let errorMessage = subCriterion ? 'Error al actualizar el subcriterio' : 'Error al crear el subcriterio';
      
      if (error instanceof Error) {
        if (error.message.includes('name')) {
          errorMessage = 'Error: El nombre del subcriterio ya existe o es inválido';
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
      <div className={`${styles.drawer} ${isVisible ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>
              {subCriterion ? 'Editar Subcriterio' : 'Nuevo Subcriterio'}
            </h2>
            <p className={styles.subtitle}>
              {subCriterion 
                ? 'Modifica la información del subcriterio de evaluación'
                : 'Define un nuevo subcriterio para medir aspectos específicos del criterio'
              }
            </p>
          </div>
          
          <button
            type="button"
            onClick={handleClose}
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

        <form onSubmit={handleSubmit} className={`${styles.form} ${loading ? styles.loading : ''}`}>
          <div className={styles.content}>
            {errors.general && (
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
                {errors.general}
              </div>
            )}

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Información del Subcriterio</h3>
              
              <div className={styles.field}>
                <label htmlFor="name" className={`${styles.label} ${styles.required}`}>
                  Nombre del Subcriterio
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`${styles.input} ${errors.name ? styles.error : ''}`}
                  placeholder="Ej: Gestión de Defectos, Tolerancia a Fallos"
                  disabled={loading}
                  maxLength={100}
                />
                {errors.name && (
                  <div className={styles.errorMessage}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M7 3V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="7" cy="10" r="0.5" fill="currentColor"/>
                    </svg>
                    {errors.name}
                  </div>
                )}
                <div className={`${styles.characterCount} ${formData.name.length > 80 ? styles.warning : ''} ${formData.name.length > 95 ? styles.error : ''}`}>
                  {formData.name.length}/100
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="description" className={styles.label}>
                  Descripción
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`${styles.textarea} ${errors.description ? styles.error : ''}`}
                  placeholder="Describe qué aspecto específico evalúa este subcriterio, cómo se mide y su importancia..."
                  disabled={loading}
                  maxLength={500}
                />
                {errors.description && (
                  <div className={styles.errorMessage}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M7 3V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="7" cy="10" r="0.5" fill="currentColor"/>
                    </svg>
                    {errors.description}
                  </div>
                )}
                <div className={`${styles.characterCount} ${formData.description.length > 400 ? styles.warning : ''} ${formData.description.length > 480 ? styles.error : ''}`}>
                  {formData.description.length}/500
                </div>
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              disabled={loading}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              disabled={!formData.name.trim()}
            >
              {subCriterion ? 'Actualizar Subcriterio' : 'Crear Subcriterio'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}