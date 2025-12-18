import React, { useState } from 'react';
import { SubCriterion, parameterizationApi, CreateSubCriterionDto, UpdateSubCriterionDto } from '../../api/parameterization/parameterization-api';
import { SubCriterionSearchResult, MetricSearchResult } from '../../types/parameterization-search.types';
import { BaseFormDrawer } from '../shared/BaseFormDrawer';
import { FormField } from '../shared/FormField';
import { Autocomplete } from './Autocomplete';
import { MetricSelectorModal } from './MetricSelectorModal';
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

/**
 * Datos opcionales de métricas para pre-llenar cuando se seleccionan subcriterios
 * con métricas asociadas (Caso B)
 */
interface MetricPreFillData {
  name: string;
  description: string;
  code: string;
  formula: string;
  desired_threshold: number | null;
  variables: { symbol: string; description: string }[];
}

export function SubCriterionFormDrawer({ subCriterion, criterionId, onClose, onSave }: SubCriterionFormDrawerProps) {
  const [formData, setFormData] = useState<FormData>({
    name: subCriterion?.name || '',
    description: subCriterion?.description || ''
  });
  
  const [showAutocomplete, setShowAutocomplete] = useState(!subCriterion);
  const [metricSelectorData, setMetricSelectorData] = useState<SubCriterionSearchResult | null>(null);
  const [selectedMetricsForParent, setSelectedMetricsForParent] = useState<MetricPreFillData[]>([]);
  const [metricIdsToCopy, setMetricIdsToCopy] = useState<number[]>([]);

  const { isVisible, loading, errors, setLoading, setErrors, handleClose, clearError } = useFormDrawer({
    initialData: subCriterion,
    onSave,
    onClose
  });

  /**
   * Maneja la selección de un subcriterio del autocompletado (Caso B: Complejo)
   * Implementa la lógica de selección de métricas según la cantidad
   */
  const handleSubCriterionSelected = (selected: SubCriterionSearchResult) => {
    // Rellenar datos del subcriterio
    setFormData({
      name: selected.name,
      description: selected.description || '',
    });
    setShowAutocomplete(false);

    // Caso B - Escenario 1: Subcriterio con 1 métrica
    if (selected.metrics_count === 1 && selected.metrics.length === 1) {
      const metric = selected.metrics[0];
      setSelectedMetricsForParent([{
        name: metric.name,
        description: metric.description || '',
        code: metric.code || '',
        formula: metric.formula || '',
        desired_threshold: metric.desired_threshold || null,
        variables: metric.variables?.map(v => ({
          symbol: v.symbol,
          description: v.description
        })) || []
      }]);
      setMetricIdsToCopy([metric.metric_id]);
    }
    // Caso B - Escenario 2: Subcriterio con múltiples métricas
    else if (selected.metrics_count > 1) {
      setMetricSelectorData(selected);
    }
    // Si no tiene métricas, solo se rellena el subcriterio
  };

  /**
   * Maneja la selección de múltiples métricas del modal (cuando hay múltiples)
   */
  const handleMetricSelectedFromModal = (metrics: MetricSearchResult[]) => {
    setSelectedMetricsForParent(metrics.map(metric => ({
      name: metric.name,
      description: metric.description || '',
      code: metric.code || '',
      formula: metric.formula || '',
      desired_threshold: metric.desired_threshold || null,
      variables: metric.variables?.map(v => ({
        symbol: v.symbol,
        description: v.description
      })) || []
    })));
    setMetricIdsToCopy(metrics.map(m => m.metric_id));
    setMetricSelectorData(null); // Cerrar modal
  };

  /**
   * Callback que pasa los datos de métricas al padre para pre-llenar
   * Este es un hook para que el componente padre pueda recibir estos datos
   */
  React.useEffect(() => {
    if (selectedMetricsForParent.length > 0) {
      // Aquí puedes emitir un evento o callback personalizado si es necesario
      // Por ahora, los datos están disponibles en el estado
      console.log('Métricas seleccionadas para pre-llenar:', selectedMetricsForParent);
    }
  }, [selectedMetricsForParent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData as unknown as Record<string, unknown>, {
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
          criterion_id: criterionId,
          metric_ids_to_copy: metricIdsToCopy.length > 0 ? metricIdsToCopy : undefined
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
    <>
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
          
          {!subCriterion && showAutocomplete ? (
            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>
                Nombre del Subcriterio * (Búsqueda inteligente)
              </label>
              <Autocomplete
                value={formData.name}
                onChange={(value) => handleInputChange('name', value)}
                onSelect={handleSubCriterionSelected}
                searchFunction={parameterizationApi.searchSubCriteria}
                getItemLabel={(item) => item.name}
                getItemDescription={(item) => item.description || ''}
                getItemMeta={(item) => (
                  <>
                    <span className={styles.badge}>{item.criterion_name}</span>
                    <span>📊 {item.metrics_count} métrica{item.metrics_count !== 1 ? 's' : ''}</span>
                  </>
                )}
                placeholder="Escribe o busca un subcriterio existente..."
                helperText="💡 Puedes reutilizar un subcriterio existente de cualquier estándar. Si tiene métricas, también podrás seleccionarlas."
                name="name"
                required
              />
              {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
            </div>
          ) : (
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
          )}

          {!subCriterion && !showAutocomplete && (
            <button
              type="button"
              onClick={() => setShowAutocomplete(true)}
              className={styles.linkButton}
            >
              🔍 Buscar subcriterio existente
            </button>
          )}

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

          {selectedMetricsForParent.length > 0 && (
            <div className={styles.infoBox}>
              <strong>✅ {selectedMetricsForParent.length} Métrica{selectedMetricsForParent.length !== 1 ? 's' : ''} seleccionada{selectedMetricsForParent.length !== 1 ? 's' : ''}:</strong>
              <ul style={{ fontSize: '0.875rem', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                {selectedMetricsForParent.map((metric, index) => (
                  <li key={index}>{metric.name} {metric.code && `(${metric.code})`}</li>
                ))}
              </ul>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Estas métricas se copiarán y asociarán automáticamente al crear el subcriterio.
              </p>
            </div>
          )}
        </div>
      </BaseFormDrawer>

      {/* Modal para seleccionar métrica cuando hay múltiples */}
      {metricSelectorData && (
        <MetricSelectorModal
          subCriterion={metricSelectorData}
          onSelect={handleMetricSelectedFromModal}
          onCancel={() => setMetricSelectorData(null)}
        />
      )}
    </>
  );
}