import React, { useState } from 'react';
import { parameterizationApi, CreateStandardDto, UpdateStandardDto, Standard } from '../../api/parameterization/parameterization-api';
import styles from './StandardFormDrawer.module.css';

interface StandardFormDrawerProps {
  standard?: Standard | null;
  onClose: () => void;
  onSave: () => void;
}

interface FormData {
  name: string;
  description: string;
  version: string;
}

export function StandardFormDrawer({ standard, onClose, onSave }: StandardFormDrawerProps) {
  const [formData, setFormData] = useState<FormData>({
    name: standard?.name || '',
    description: standard?.description || '',
    version: standard?.version || '1.0'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
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

    // Validar versión (opcional pero con límites)
    if (formData.version.trim() && formData.version.trim().length > 20) {
      newErrors.version = 'La versión no puede exceder 20 caracteres';
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
      if (standard) {
        // Update existing standard
        const updateData: UpdateStandardDto = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          version: formData.version.trim() || undefined
        };
        
        await parameterizationApi.updateStandard(standard.id, updateData);
      } else {
        // Create new standard
        const createData: CreateStandardDto = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          version: formData.version.trim() || undefined
        };
        
        console.log('Creating standard with data:', createData); // Debug log
        await parameterizationApi.createStandard(createData);
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving standard:', error);
      
      // Mejorar el manejo de errores
      let errorMessage = standard ? 'Error al actualizar el estándar' : 'Error al crear el estándar';
      
      if (error instanceof Error) {
        // Intentar extraer más información del error
        if (error.message.includes('name')) {
          errorMessage = 'Error: El nombre del estándar ya existe o es inválido';
        } else if (error.message.includes('version')) {
          errorMessage = 'Error: La versión del estándar es inválida';
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
    setTimeout(onClose, 300); // Wait for animation
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}>
      <div className={`${styles.drawer} ${isVisible ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>
              {standard ? 'Editar Estándar' : 'Nuevo Estándar'}
            </h2>
            <p className={styles.subtitle}>
              {standard 
                ? 'Modifica la información del estándar de calidad'
                : 'Crea un nuevo estándar de calidad para tu organización'
              }
            </p>
          </div>
          
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
              <h3 className={styles.sectionTitle}>Información Básica</h3>
              
              <div className={styles.row}>
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
                    placeholder="Ej: ISO 25010"
                    disabled={loading}
                  />
                  {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
                </div>

                <div className={styles.field}>
                  <label htmlFor="version" className={styles.label}>
                    Versión *
                  </label>
                  <input
                    type="text"
                    id="version"
                    value={formData.version}
                    onChange={(e) => handleInputChange('version', e.target.value)}
                    className={`${styles.input} ${errors.version ? styles.error : ''}`}
                    placeholder="Ej: 1.0, 2023.1"
                    disabled={loading}
                  />
                  {errors.version && <span className={styles.fieldError}>{errors.version}</span>}
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
                  className={styles.textarea}
                  rows={4}
                  placeholder="Describe el estándar de calidad, su propósito y alcance..."
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className={styles.saveButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  {standard ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                standard ? 'Actualizar Estándar' : 'Crear Estándar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}