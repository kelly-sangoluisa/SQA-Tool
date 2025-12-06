import React, { useState } from 'react';
import { Criterion, parameterizationApi, CreateCriterionDto, UpdateCriterionDto } from '../../api/parameterization/parameterization-api';
import { BaseFormDrawer } from '../shared/BaseFormDrawer';
import { FormField } from '../shared/FormField';
import { useFormDrawer } from '../../hooks/shared/useFormDrawer';
import { validateForm, handleApiError } from '../../utils/validation';
import styles from '../shared/FormDrawer.module.css';

interface CriterionFormDrawerProps {
  readonly criterion?: Criterion | null;
  readonly standardId?: number;
  readonly onClose: () => void;
  readonly onSave: (savedCriterion?: Criterion) => void;
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

  const { isVisible, loading, errors, setLoading, setErrors, handleClose, clearError } = useFormDrawer({
    initialData: criterion,
    onSave,
    onClose
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData, {
      name: { required: true, minLength: 2, maxLength: 100 },
      description: { maxLength: 500 }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      let savedCriterion: Criterion;
      
      if (criterion) {
        const updateData: UpdateCriterionDto = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined
        };
        savedCriterion = await parameterizationApi.updateCriterion(criterion.id, updateData);
      } else {
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
      const errorMessage = handleApiError(error, criterion ? 'actualizar' : 'crear', 'el criterio');
      if (error instanceof Error) {
        if (error.message.includes('Internal server error')) {
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
      title={criterion ? 'Editar Criterio' : 'Nuevo Criterio'}
      subtitle={criterion 
        ? 'Modifica la información del criterio de evaluación'
        : 'Define un nuevo criterio para evaluar la calidad del software'
      }
      onClose={handleClose}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={criterion ? 'Actualizar Criterio' : 'Crear Criterio'}
      submitDisabled={!formData.name.trim()}
      generalError={errors.general}
    >
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Información del Criterio</h3>
        
        <FormField
          id="name"
          label="Nombre del Criterio"
          value={formData.name}
          onChange={(value) => handleInputChange('name', value)}
          placeholder="Ej: Funcionalidad, Confiabilidad, Usabilidad"
          disabled={loading}
          error={errors.name}
          required
          maxLength={100}
        />

        <FormField
          id="description"
          label="Descripción"
          value={formData.description}
          onChange={(value) => handleInputChange('description', value)}
          placeholder="Describe qué aspecto de la calidad evalúa este criterio, su importancia y cómo se mide..."
          disabled={loading}
          error={errors.description}
          maxLength={500}
          type="textarea"
        />
      </div>
    </BaseFormDrawer>
  );
}