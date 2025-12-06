import React, { useState } from 'react';
import { parameterizationApi, CreateStandardDto, UpdateStandardDto, Standard } from '../../api/parameterization/parameterization-api';
import { BaseFormDrawer } from '../shared/BaseFormDrawer';
import { FormField } from '../shared/FormField';
import { useFormDrawer } from '../../hooks/shared/useFormDrawer';
import { validateForm, handleApiError } from '../../utils/validation';
import styles from '../shared/FormDrawer.module.css';

interface StandardFormDrawerProps {
  readonly standard?: Standard | null;
  readonly onClose: () => void;
  readonly onSave: (savedStandard?: Standard) => void;
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

  const { isVisible, loading, errors, setLoading, setErrors, handleClose, clearError } = useFormDrawer({
    initialData: standard,
    onSave,
    onClose
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData, {
      name: { required: true, minLength: 2, maxLength: 100 },
      description: { maxLength: 500 },
      version: { maxLength: 20 }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      let savedStandard: Standard;
      
      if (standard) {
        const updateData: UpdateStandardDto = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          version: formData.version.trim() || undefined
        };
        savedStandard = await parameterizationApi.updateStandard(standard.id, updateData);
      } else {
        const createData: CreateStandardDto = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          version: formData.version.trim() || undefined
        };
        console.log('Creating standard with data:', createData);
        savedStandard = await parameterizationApi.createStandard(createData);
      }
      
      onSave(savedStandard);
    } catch (error) {
      console.error('Error saving standard:', error);
      const errorMessage = handleApiError(error, standard ? 'actualizar' : 'crear', 'el estándar');
      if (error instanceof Error) {
        if (error.message.includes('name')) {
          // Error already handled by handleApiError
        }
      }
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field);
  };

  return (
    <BaseFormDrawer
      isVisible={isVisible}
      title={standard ? 'Editar Estándar' : 'Nuevo Estándar'}
      subtitle={standard 
        ? 'Modifica la información del estándar de calidad'
        : 'Crea un nuevo estándar de calidad para tu organización'
      }
      onClose={handleClose}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={standard ? 'Actualizar Estándar' : 'Crear Estándar'}
      submitDisabled={!formData.name.trim() || !formData.version.trim()}
      generalError={errors.general}
    >
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Información Básica</h3>
        
        <FormField
          id="name"
          label="Nombre del Estándar"
          value={formData.name}
          onChange={(value) => handleInputChange('name', value)}
          placeholder="Ej: ISO 25010, CMMI, IEEE 730"
          disabled={loading}
          error={errors.name}
          required
          maxLength={100}
        />

        <FormField
          id="version"
          label="Versión"
          value={formData.version}
          onChange={(value) => handleInputChange('version', value)}
          placeholder="Ej: 1.0, 2023.1, v2.0"
          disabled={loading}
          error={errors.version}
          required
          maxLength={20}
        />

        <FormField
          id="description"
          label="Descripción"
          value={formData.description}
          onChange={(value) => handleInputChange('description', value)}
          placeholder="Describe el estándar de calidad, su propósito, alcance y principales características..."
          disabled={loading}
          error={errors.description}
          maxLength={500}
          type="textarea"
        />
      </div>
    </BaseFormDrawer>
  );
}