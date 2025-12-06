import React, { useState } from 'react';
import { SubCriterion, parameterizationApi, CreateSubCriterionDto, UpdateSubCriterionDto } from '../../api/parameterization/parameterization-api';
import { BaseFormDrawer } from '../shared/BaseFormDrawer';
import { FormField } from '../shared/FormField';
import { useFormDrawer } from '../../hooks/shared/useFormDrawer';
import { validateForm, handleApiError } from '../../utils/validation';
import styles from '../shared/FormDrawer.module.css';

interface SubCriterionFormDrawerProps {
  readonly subCriterion?: SubCriterion | null;
  readonly criterionId?: number;
  readonly onClose: () => void;
  readonly onSave: (savedSubCriterion?: SubCriterion) => void;
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

  const { isVisible, loading, errors, setLoading, setErrors, handleClose, clearError } = useFormDrawer({
    initialData: subCriterion,
    onSave,
    onClose
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData as Record<string, unknown>, {
      name: { required: true, minLength: 2, maxLength: 100 },
      description: { maxLength: 500 }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      let savedSubCriterion: SubCriterion;
      
      if (subCriterion) {
        const updateData: UpdateSubCriterionDto = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined
        };
        savedSubCriterion = await parameterizationApi.updateSubCriterion(subCriterion.id, updateData);
      } else {
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
      const errorMessage = handleApiError(error, subCriterion ? 'actualizar' : 'crear', 'el subcriterio');
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
      title={subCriterion ? 'Editar Subcriterio' : 'Nuevo Subcriterio'}
      subtitle={subCriterion 
        ? 'Modifica la información del subcriterio de evaluación'
        : 'Define un nuevo subcriterio para medir aspectos específicos del criterio'
      }
      onClose={handleClose}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={subCriterion ? 'Actualizar Subcriterio' : 'Crear Subcriterio'}
      submitDisabled={!formData.name.trim()}
      generalError={errors.general}
    >
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Información del Subcriterio</h3>
        
        <FormField
          id="name"
          label="Nombre del Subcriterio"
          value={formData.name}
          onChange={(value) => handleInputChange('name', value)}
          placeholder="Ej: Gestión de Defectos, Tolerancia a Fallos"
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
          placeholder="Describe qué aspecto específico evalúa este subcriterio, cómo se mide y su importancia..."
          disabled={loading}
          error={errors.description}
          maxLength={500}
          type="textarea"
        />
      </div>
    </BaseFormDrawer>
  );
}