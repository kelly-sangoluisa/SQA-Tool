import React, { useState } from 'react';
import { Criterion, parameterizationApi, CreateCriterionDto, UpdateCriterionDto } from '../../api/parameterization/parameterization-api';
import { CriterionSearchResult } from '../../types/parameterization-search.types';
import { BaseFormDrawer } from '../shared/BaseFormDrawer';
import { ValidatedFormField } from '../shared/ValidatedFormField';
import { Autocomplete } from './Autocomplete';
import { useFormDrawer } from '../../hooks/shared/useFormDrawer';
import { handleApiError } from '../../utils/validation';
import { validateCriterionName, validateDescription } from '../../utils/parameterization-validation';
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

// Helper function to render criterion metadata badge
const renderCriterionMeta = (item: CriterionSearchResult) => (
  <span className={styles.badge}>{item.standard_name}</span>
);

export function CriterionFormDrawer({ criterion, standardId, onClose, onSave }: CriterionFormDrawerProps) {
  const [formData, setFormData] = useState<FormData>({
    name: criterion?.name || '',
    description: criterion?.description || ''
  });

  const [showAutocomplete, setShowAutocomplete] = useState(!criterion);

  const { isVisible, loading, errors, setLoading, setErrors, handleClose, clearError } = useFormDrawer({
    initialData: criterion,
    onSave,
    onClose
  });

  /**
   * Maneja la selección de un criterio del autocompletado
   * Rellena automáticamente los campos con los datos del criterio seleccionado
   */
  const handleCriterionSelected = (selected: CriterionSearchResult) => {
    setFormData({
      name: selected.name,
      description: selected.description || '',
    });
    setShowAutocomplete(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nameValidation = validateCriterionName(formData.name);
    const descriptionValidation = validateDescription(formData.description, 500);

    if (!nameValidation.valid || !descriptionValidation.valid) {
      setErrors({
        name: nameValidation.error,
        description: descriptionValidation.error
      });
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
        
        {!criterion && showAutocomplete ? (
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              Nombre del Criterio * (Búsqueda inteligente)
            </label>
            <Autocomplete
              value={formData.name}
              onChange={(value) => handleInputChange('name', value)}
              onSelect={handleCriterionSelected}
              searchFunction={parameterizationApi.searchCriteria}
              getItemLabel={(item) => item.name}
              getItemDescription={(item) => item.description || ''}
              getItemMeta={renderCriterionMeta}
              placeholder="Escribe o busca un criterio existente..."
              helperText="💡 Puedes reutilizar un criterio existente de cualquier estándar"
              name="name"
              required
            />
            {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
          </div>
        ) : (
          <ValidatedFormField
            id="name"
            label="Nombre del Criterio"
            value={formData.name}
            onChange={(value) => handleInputChange('name', value)}
            placeholder="Ej: Funcionalidad, Confiabilidad, Usabilidad"
            disabled={loading}
            required
            maxLength={100}
            validateFn={validateCriterionName}
            validateOnChange={true}
            helperText="Nombre del criterio de evaluación de calidad"
          />
        )}

        {!criterion && !showAutocomplete && (
          <button
            type="button"
            onClick={() => setShowAutocomplete(true)}
            className={styles.linkButton}
          >
            🔍 Buscar criterio existente
          </button>
        )}

        <ValidatedFormField
          id="description"
          label="Descripción"
          value={formData.description}
          onChange={(value) => handleInputChange('description', value)}
          placeholder="Describe qué aspecto de la calidad evalúa este criterio, su importancia y cómo se mide..."
          disabled={loading}
          maxLength={500}
          type="textarea"
          rows={4}
          validateFn={(val) => validateDescription(val, 500)}
          validateOnChange={false}
          helperText="Explica el propósito y alcance de este criterio de calidad"
        />
      </div>
    </BaseFormDrawer>
  );
}