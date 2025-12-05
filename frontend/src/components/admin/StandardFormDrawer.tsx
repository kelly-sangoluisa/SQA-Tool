import React, { useState } from 'react';
import { parameterizationApi, CreateStandardDto } from '../../api/parameterization/parameterization-api';
import styles from './StandardFormDrawer.module.css';

interface StandardFormDrawerProps {
  onClose: () => void;
  onSave: () => void;
}

interface FormData {
  name: string;
  description: string;
  version: string;
}

export function StandardFormDrawer({ onClose, onSave }: StandardFormDrawerProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    version: '1.0'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.version.trim()) {
      newErrors.version = 'La versión es requerida';
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
      const createData: CreateStandardDto = {
        name: formData.name,
        description: formData.description || undefined,
        version: formData.version
      };
      
      await parameterizationApi.createStandard(createData);
      onSave();
    } catch (error) {
      console.error('Error creating standard:', error);
      setErrors({ general: 'Error al crear el estándar' });
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
            <h2 className={styles.title}>Nuevo Estándar</h2>
            <p className={styles.subtitle}>
              Crea un nuevo estándar de calidad para tu organización
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
                  Creando...
                </>
              ) : (
                'Crear Estándar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}