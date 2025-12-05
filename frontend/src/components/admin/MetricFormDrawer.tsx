import React, { useState, useEffect } from 'react';
import { Metric, FormulaVariable, parameterizationApi, CreateMetricDto, UpdateMetricDto } from '../../api/parameterization/parameterization-api';
import styles from './MetricFormDrawer.module.css';

interface MetricFormDrawerProps {
  metric?: Metric | null;
  subCriterionId?: number;
  onClose: () => void;
  onSave: () => void;
}

interface FormData {
  name: string;
  description: string;
  code: string;
  formula: string;
  desired_threshold: number | null;
  variables: { symbol: string; description: string; tempId?: string }[];
}

export function MetricFormDrawer({ metric, subCriterionId, onClose, onSave }: MetricFormDrawerProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    code: '',
    formula: '',
    desired_threshold: null,
    variables: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    if (metric) {
      setFormData({
        name: metric.name || '',
        description: metric.description || '',
        code: metric.code || '',
        formula: metric.formula || '',
        desired_threshold: metric.desired_threshold,
        variables: metric.variables?.map(v => ({
          symbol: v.symbol,
          description: v.description
        })) || []
      });
    }
  }, [metric]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!subCriterionId && !metric?.sub_criterion_id) {
      newErrors.general = 'ID de sub-criterio requerido';
    }

    // Validate variables
    formData.variables.forEach((variable, index) => {
      if (!variable.symbol.trim()) {
        newErrors[`variable-symbol-${index}`] = 'El símbolo es requerido';
      }
      if (!variable.description.trim()) {
        newErrors[`variable-description-${index}`] = 'La descripción es requerida';
      }
    });

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
      if (metric) {
        // Update existing metric
        const updateData: UpdateMetricDto = {
          name: formData.name,
          description: formData.description || undefined,
          code: formData.code || undefined,
          formula: formData.formula || undefined,
          desired_threshold: formData.desired_threshold || undefined
        };
        
        await parameterizationApi.updateMetric(metric.id, updateData);

        // Update variables
        if (metric.variables) {
          // Delete old variables
          await Promise.all(
            metric.variables.map(v => 
              parameterizationApi.deleteVariable(v.id)
            )
          );
        }

        // Create new variables
        if (formData.variables.length > 0) {
          await Promise.all(
            formData.variables.map(v =>
              parameterizationApi.createVariable({
                symbol: v.symbol,
                description: v.description,
                metric_id: metric.id
              })
            )
          );
        }
      } else {
        // Create new metric
        const createData: CreateMetricDto = {
          name: formData.name,
          description: formData.description || undefined,
          code: formData.code || undefined,
          formula: formData.formula || undefined,
          desired_threshold: formData.desired_threshold || undefined,
          sub_criterion_id: subCriterionId!
        };
        
        const newMetric = await parameterizationApi.createMetric(createData);

        // Create variables
        if (formData.variables.length > 0) {
          await Promise.all(
            formData.variables.map(v =>
              parameterizationApi.createVariable({
                symbol: v.symbol,
                description: v.description,
                metric_id: newMetric.id
              })
            )
          );
        }
      }

      onSave();
    } catch (error) {
      console.error('Error saving metric:', error);
      setErrors({ general: 'Error al guardar la métrica' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  const addVariable = () => {
    setFormData(prev => ({
      ...prev,
      variables: [
        ...prev.variables,
        { symbol: '', description: '', tempId: `temp-${Date.now()}` }
      ]
    }));
  };

  const updateVariable = (index: number, field: 'symbol' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      )
    }));
  };

  const removeVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}>
      <div className={`${styles.drawer} ${isVisible ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>
              {metric ? 'Editar Métrica' : 'Nueva Métrica'}
            </h2>
            <p className={styles.subtitle}>
              {metric ? 'Modifica los datos de la métrica' : 'Agrega una nueva métrica al sub-criterio'}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`${styles.input} ${errors.name ? styles.error : ''}`}
                    placeholder="Ej: Porcentaje de éxito"
                  />
                  {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
                </div>

                <div className={styles.field}>
                  <label htmlFor="code" className={styles.label}>
                    Código
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    className={styles.input}
                    placeholder="Ej: PO-1"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="description" className={styles.label}>
                  Descripción
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className={styles.textarea}
                  rows={3}
                  placeholder="Describe qué mide esta métrica..."
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="threshold" className={styles.label}>
                  Umbral Deseado (%)
                </label>
                <input
                  type="number"
                  id="threshold"
                  value={formData.desired_threshold || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    desired_threshold: e.target.value ? parseFloat(e.target.value) : null 
                  }))}
                  className={styles.input}
                  placeholder="Ej: 95"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Fórmula</h3>
              
              <div className={styles.field}>
                <label htmlFor="formula" className={styles.label}>
                  Expresión Matemática
                </label>
                <textarea
                  id="formula"
                  value={formData.formula}
                  onChange={(e) => setFormData(prev => ({ ...prev, formula: e.target.value }))}
                  className={`${styles.textarea} ${styles.formula}`}
                  rows={3}
                  placeholder="Ej: (N_EXITO / N_TOTAL) * 100"
                />
              </div>

              <div className={styles.variablesSection}>
                <div className={styles.variablesHeader}>
                  <h4 className={styles.variablesTitle}>Variables Definidas</h4>
                  <button
                    type="button"
                    onClick={addVariable}
                    className={styles.addButton}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 1V15M1 8H15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Agregar Variable
                  </button>
                </div>

                {formData.variables.length === 0 ? (
                  <div className={styles.emptyVariables}>
                    <p>No hay variables definidas. Agrega variables para usar en la fórmula.</p>
                  </div>
                ) : (
                  <div className={styles.variablesList}>
                    {formData.variables.map((variable, index) => (
                      <div key={variable.tempId || index} className={styles.variableItem}>
                        <div className={styles.variableFields}>
                          <div className={styles.field}>
                            <input
                              type="text"
                              value={variable.symbol}
                              onChange={(e) => updateVariable(index, 'symbol', e.target.value)}
                              className={`${styles.input} ${styles.symbolInput} ${errors[`variable-symbol-${index}`] ? styles.error : ''}`}
                              placeholder="Símbolo (ej: N_EXITO)"
                            />
                            {errors[`variable-symbol-${index}`] && (
                              <span className={styles.fieldError}>{errors[`variable-symbol-${index}`]}</span>
                            )}
                          </div>
                          
                          <div className={styles.field}>
                            <input
                              type="text"
                              value={variable.description}
                              onChange={(e) => updateVariable(index, 'description', e.target.value)}
                              className={`${styles.input} ${styles.descriptionInput} ${errors[`variable-description-${index}`] ? styles.error : ''}`}
                              placeholder="Descripción (ej: Número de casos exitosos)"
                            />
                            {errors[`variable-description-${index}`] && (
                              <span className={styles.fieldError}>{errors[`variable-description-${index}`]}</span>
                            )}
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeVariable(index)}
                          className={styles.removeButton}
                          aria-label="Eliminar variable"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M12 4L4 12M4 4L12 12"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {formData.variables.length > 0 && (
                  <div className={styles.variablesPreview}>
                    <h5>Vista Previa de Variables:</h5>
                    <div className={styles.chipsContainer}>
                      {formData.variables.filter(v => v.symbol && v.description).map((variable, index) => (
                        <span key={index} className={styles.variableChip}>
                          <span className={styles.chipSymbol}>{variable.symbol}</span>
                          <span className={styles.chipDescription}>{variable.description}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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
                  {metric ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                metric ? 'Actualizar Métrica' : 'Crear Métrica'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}