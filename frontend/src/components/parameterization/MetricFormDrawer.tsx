import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Metric, parameterizationApi, CreateMetricDto, UpdateMetricDto } from '../../api/parameterization/parameterization-api';
import { MetricSearchResult } from '../../types/parameterization-search.types';
import { Button } from '../shared/Button';
import { Autocomplete } from './Autocomplete';
import { Toast } from '../shared/Toast';
import { useToast } from '../../hooks/shared/useToast';
import { validateThresholdFormat } from '../../utils/data-entry/thresholdUtils';
import { 
  validateMetricName, 
  validateMetricCode, 
  validateFormula,
  validateVariableSymbol,
  validateVariableDescription,
  validateThreshold,
  validateVariablesMatchFormula,
  extractVariablesFromFormula
} from '../../utils/parameterization-validation';
import styles from '../shared/FormDrawer.module.css';

interface MetricFormDrawerProps {
  readonly metric?: Metric | null;
  readonly subCriterionId?: number;
  readonly onClose: () => void;
  readonly onSave: () => void;
}

interface FormData {
  name: string;
  description: string;
  code: string;
  formula: string;
  desired_threshold: string;
  worst_case: string;
  variables: { id?: number; symbol: string; description: string; tempId?: string }[];
}

// Helper function to render metric metadata
const renderMetricMeta = (item: MetricSearchResult) => (
  <>
    {item.code && <span className={styles.badge}>{item.code}</span>}
    {item.formula && <span>📐 Con fórmula</span>}
    {item.variables && item.variables.length > 0 && (
      <span>🔢 {item.variables.length} variable{item.variables.length === 1 ? '' : 's'}</span>
    )}
  </>
);

export function MetricFormDrawer({ metric, subCriterionId, onClose, onSave }: MetricFormDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    code: '',
    formula: '',
    desired_threshold: '',
    worst_case: '',
    variables: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fieldValidation, setFieldValidation] = useState<Record<string, { valid: boolean; message?: string }>>({});
  const [isVisible, setIsVisible] = useState(false);
  const [tempIdCounter, setTempIdCounter] = useState(0);
  const [showAutocomplete, setShowAutocomplete] = useState(true);
  
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Bloquear scroll del body cuando el drawer está visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  useEffect(() => {
    setIsVisible(true);
    
    if (metric) {
      setFormData({
        name: metric.name || '',
        description: metric.description || '',
        code: metric.code || '',
        formula: metric.formula || '',
        desired_threshold: metric.desired_threshold || '',
        worst_case: metric.worst_case || '',
        variables: metric.variables?.map(v => ({
          id: v.id, // Mantener el ID para actualizar en lugar de recrear
          symbol: v.symbol,
          description: v.description
        })) || []
      });
      setShowAutocomplete(false); // Desactivar autocomplete en modo edición
    }
  }, [metric]);

  /**
   * Maneja la selección de una métrica del autocompletado (Caso A: Simple)
   * Rellena automáticamente los campos con los datos de la métrica seleccionada
   * INCLUYENDO las variables de fórmula
   */
  const handleMetricSelected = (selectedMetric: MetricSearchResult) => {
    // Asignar tempIds a las variables para que React las renderice correctamente
    const variablesWithTempIds = selectedMetric.variables?.map((v, idx) => ({
      symbol: v.symbol,
      description: v.description,
      tempId: `temp-imported-${Date.now()}-${idx}`
    })) || [];

    setFormData({
      name: selectedMetric.name,
      description: selectedMetric.description || '',
      code: selectedMetric.code || '',
      formula: selectedMetric.formula || '',
      desired_threshold: selectedMetric.desired_threshold || '',
      worst_case: selectedMetric.worst_case || '',
      variables: variablesWithTempIds
    });

    // Actualizar el contador para que las nuevas variables tengan IDs únicos
    if (variablesWithTempIds.length > 0) {
      setTempIdCounter(variablesWithTempIds.length);
    }

    setShowAutocomplete(false); // Ocultar autocomplete después de seleccionar
  };

  // Validación en tiempo real para campos específicos
  const validateFieldOnChange = (fieldName: string, value: string) => {
    let validationResult;

    switch (fieldName) {
      case 'name':
        validationResult = validateMetricName(value);
        break;
      case 'code':
        validationResult = validateMetricCode(value);
        break;
      case 'formula':
        validationResult = validateFormula(value);
        break;
      case 'desired_threshold':
        validationResult = validateThreshold(value, 'umbral deseado');
        break;
      case 'worst_case':
        validationResult = validateThreshold(value, 'peor caso');
        break;
      default:
        validationResult = { valid: true, error: undefined, warning: undefined, success: undefined };
    }

    setFieldValidation(prev => ({
      ...prev,
      [fieldName]: {
        valid: validationResult.valid,
        message: validationResult.error || validationResult.warning || validationResult.success
      }
    }));
  };

  const validateRequiredFields = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Completa este campo';
    if (!formData.code.trim()) errors.code = 'Completa este campo';
    if (!formData.formula.trim()) errors.formula = 'Completa este campo';
    if (!formData.desired_threshold.trim()) errors.desired_threshold = 'Completa este campo';
    if (!formData.worst_case.trim()) errors.worst_case = 'Completa este campo';
    return errors;
  };

  const validateFieldFormats = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    const nameValidation = validateMetricName(formData.name);
    if (!nameValidation.valid) errors.name = nameValidation.error!;

    const codeValidation = validateMetricCode(formData.code);
    if (!codeValidation.valid) errors.code = codeValidation.error!;

    const formulaValidation = validateFormula(formData.formula, true);
    if (!formulaValidation.valid) errors.formula = formulaValidation.error!;

    if (formData.formula.trim()) {
      const variablesValidation = validateVariablesMatchFormula(formData.formula, formData.variables);
      if (!variablesValidation.valid) errors.variables = variablesValidation.error!;
    }

    if (!subCriterionId && !metric?.sub_criterion_id) {
      errors.general = 'ID de sub-criterio requerido';
    }

    if (formData.desired_threshold) {
      const thresholdValidation = validateThreshold(formData.desired_threshold, 'umbral deseado');
      if (!thresholdValidation.valid) errors.desired_threshold = thresholdValidation.error || 'Formato de umbral inválido';
    }

    if (formData.worst_case) {
      const worstCaseValidation = validateThreshold(formData.worst_case, 'peor caso');
      if (!worstCaseValidation.valid) errors.worst_case = worstCaseValidation.error || 'Formato de peor caso inválido';
    }

    return errors;
  };

  const validateVariables = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    formData.variables.forEach((variable, index) => {
      const symbolValidation = validateVariableSymbol(variable.symbol);
      if (!symbolValidation.valid) errors[`variable-symbol-${index}`] = symbolValidation.error!;

      const descValidation = validateVariableDescription(variable.description);
      if (!descValidation.valid) errors[`variable-description-${index}`] = descValidation.error!;
    });
    return errors;
  };

  const validateForm = (): boolean => {
    const requiredErrors = validateRequiredFields();
    if (Object.keys(requiredErrors).length > 0) {
      setErrors(requiredErrors);
      return false;
    }

    const newErrors = { ...validateFieldFormats(), ...validateVariables() };
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
          desired_threshold: formData.desired_threshold || undefined,
          worst_case: formData.worst_case || undefined
        };
        
        await parameterizationApi.updateMetric(metric.id, updateData);

        // Actualizar variables de forma inteligente
        const existingVariableIds = new Set(metric.variables?.map(v => v.id) || []);
        
        // 1. Las variables ya se eliminan inmediatamente cuando el usuario hace clic en X
        
        // 2. Actualizar variables existentes
        const variablesToUpdate = formData.variables.filter((v): v is typeof v & { id: number } => 
          typeof v.id === 'number' && existingVariableIds.has(v.id)
        );
        await Promise.all(
          variablesToUpdate.map(v =>
            parameterizationApi.updateVariable(v.id, {
              symbol: v.symbol,
              description: v.description,
              metric_id: metric.id
            })
          )
        );

        // 3. Crear variables nuevas (las que no tienen ID)
        const variablesToCreate = formData.variables.filter(v => !v.id);
        await Promise.all(
          variablesToCreate.map(v =>
            parameterizationApi.createVariable({
              symbol: v.symbol,
              description: v.description,
              metric_id: metric.id
            })
          )
        );
      } else {
        // Create new metric
        const createData: CreateMetricDto = {
          name: formData.name,
          description: formData.description || undefined,
          code: formData.code || undefined,
          formula: formData.formula || undefined,
          desired_threshold: formData.desired_threshold || undefined,
          worst_case: formData.worst_case || undefined,
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

      showToast(
        metric ? '✅ Métrica actualizada exitosamente' : '✅ Métrica creada exitosamente',
        'success'
      );
      
      setTimeout(() => {
        onSave();
      }, 500);
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

  // Sincronizar variables con la fórmula cuando cambia
  const syncVariablesWithFormula = (formula: string) => {
    if (!formula.trim()) {
      return;
    }

    const requiredVars = extractVariablesFromFormula(formula);
    const currentSymbols = formData.variables.map(v => v.symbol.trim()).filter(s => s.length > 0);

    // Si las variables ya coinciden, no hacer nada
    if (JSON.stringify(requiredVars.sort((a, b) => a.localeCompare(b))) === JSON.stringify(currentSymbols.sort((a, b) => a.localeCompare(b)))) {
      return;
    }

    // Crear nuevas variables basadas en la fórmula
    const newVariables = requiredVars.map((symbol, idx) => {
      // Buscar si ya existe una variable con este símbolo
      const existing = formData.variables.find(v => v.symbol === symbol);
      if (existing) {
        return existing;
      }
      // Crear nueva variable vacía
      return {
        symbol,
        description: '',
        tempId: `temp-formula-${Date.now()}-${idx}`
      };
    });

    setFormData(prev => ({
      ...prev,
      variables: newVariables
    }));
  };

  const addVariable = () => {
    // Validar si ya se cumple con las variables de la fórmula
    if (formData.formula.trim()) {
      const requiredVars = extractVariablesFromFormula(formData.formula);
      const currentSymbols = formData.variables.map(v => v.symbol.trim()).filter(s => s.length > 0);
      
      if (currentSymbols.length >= requiredVars.length) {
        setErrors({ 
          variables: `No puede agregar más variables. La fórmula solo requiere: ${requiredVars.join(', ')}` 
        });
        return;
      }
    }

    setTempIdCounter(prev => prev + 1);
    setFormData(prev => ({
      ...prev,
      variables: [
        ...prev.variables,
        { symbol: '', description: '', tempId: `temp-${tempIdCounter + 1}` }
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

  const removeVariable = async (index: number) => {
    const variableToRemove = formData.variables[index];
    
    // Remover inmediatamente del estado local (optimistic update)
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
    
    // Si la variable tiene ID (existe en BD), eliminarla del backend
    if (variableToRemove.id) {
      try {
        await parameterizationApi.deleteVariable(variableToRemove.id);
        console.log(`✅ Variable ${variableToRemove.id} (${variableToRemove.symbol}) eliminada de la base de datos`);
      } catch (error) {
        console.error('❌ Error al eliminar variable:', error);
        setErrors({ general: `Error al eliminar la variable "${variableToRemove.symbol}": ${error}` });
        
        // Si falla, restaurar la variable en su posición original
        setFormData(prev => ({
          ...prev,
          variables: [
            ...prev.variables.slice(0, index),
            variableToRemove,
            ...prev.variables.slice(index)
          ]
        }));
      }
    }
  };

  const drawerContent = (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
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
                {errors.general}
              </div>
            )}

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Información Básica</h3>
              
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="name" className={`${styles.label} ${styles.required}`}>
                    Nombre {!metric && '(Búsqueda inteligente)'}
                  </label>
                  {!metric && showAutocomplete ? (
                    <Autocomplete
                      value={formData.name}
                      onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                      onSelect={handleMetricSelected}
                      searchFunction={parameterizationApi.searchMetrics}
                      getItemLabel={(item) => item.name}
                      getItemDescription={(item) => item.description || ''}
                      getItemMeta={renderMetricMeta}
                      placeholder="Escribe o busca una métrica existente..."
                      helperText="💡 Puedes reutilizar una métrica existente de cualquier estándar"
                      name="name"
                      error={errors.name}
                    />
                  ) : (
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, name: e.target.value }));
                        if (errors.name) {
                          setErrors(prev => ({ ...prev, name: '' }));
                        }
                      }}
                      className={`${styles.input} ${errors.name ? styles.error : ''}}`}
                      placeholder="Ej: Porcentaje de éxito"
                    />
                  )}
                  {!metric && !showAutocomplete && (
                    <button
                      type="button"
                      onClick={() => setShowAutocomplete(true)}
                      className={styles.linkButton}
                    >
                      🔍 Buscar métrica existente
                    </button>
                  )}
                  {/* Solo mostrar error si NO está usando Autocomplete */}
                  {!showAutocomplete && errors.name && <span className={styles.fieldError}>{errors.name}</span>}
                </div>

                <div className={styles.field}>
                  <label htmlFor="code" className={`${styles.label} ${styles.required}`}>
                    Código
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={formData.code}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, code: e.target.value }));
                      if (errors.code) {
                        setErrors(prev => ({ ...prev, code: '' }));
                      }
                    }}
                    className={`${styles.input} ${errors.code ? styles.error : ''}`}
                    placeholder="Ej: PO-1"
                  />
                  {errors.code && <span className={styles.fieldError}>{errors.code}</span>}
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
                <label htmlFor="threshold" className={`${styles.label} ${styles.required}`}>
                  Umbral Deseado
                </label>
                <input
                  type="text"
                  id="threshold"
                  value={formData.desired_threshold}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ 
                      ...prev, 
                      desired_threshold: value
                    }));
                    // Limpiar error cuando el usuario empieza a escribir
                    if (errors.desired_threshold) {
                      setErrors(prev => ({ ...prev, desired_threshold: '' }));
                    }
                    validateFieldOnChange('desired_threshold', value);
                  }}
                  className={`${styles.input} ${errors.desired_threshold ? styles.error : ''} ${!errors.desired_threshold && fieldValidation.desired_threshold?.valid && formData.desired_threshold ? styles.success : ''}`}
                  placeholder="Ej: 0, 1, >=10/3min, 20 min, 0%, 0 seg, 0/1min"
                />
                {errors.desired_threshold && (
                  <span className={styles.fieldError}>{errors.desired_threshold}</span>
                )}
                {!errors.desired_threshold && fieldValidation.desired_threshold?.message && formData.desired_threshold && (
                  <span className={`${styles.feedbackMessage} ${fieldValidation.desired_threshold.message.includes('✓') || fieldValidation.desired_threshold.message.includes('válido') ? styles.successMessage : styles.warningMessage}`}>
                    {fieldValidation.desired_threshold.message}
                  </span>
                )}
                <span className={styles.helpText}>
                  💡 Ejemplos: numéricos (0, 1), comparadores (&gt;=10/3min), unidades (20 min, 0%, 0 seg)
                </span>
              </div>

              <div className={styles.field}>
                <label htmlFor="worstCase" className={`${styles.label} ${styles.required}`}>
                  Peor Caso
                </label>
                <input
                  type="text"
                  id="worstCase"
                  value={formData.worst_case}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ 
                      ...prev, 
                      worst_case: value
                    }));
                    // Limpiar error cuando el usuario empieza a escribir
                    if (errors.worst_case) {
                      setErrors(prev => ({ ...prev, worst_case: '' }));
                    }
                    validateFieldOnChange('worst_case', value);
                  }}
                  className={`${styles.input} ${errors.worst_case ? styles.error : ''} ${!errors.worst_case && fieldValidation.worst_case?.valid && formData.worst_case ? styles.success : ''}`}
                  placeholder="Ej: 0, 1, 0/3min, >20 min, >=10%, >= 15 seg, >=4"
                />
                {errors.worst_case && (
                  <span className={styles.fieldError}>{errors.worst_case}</span>
                )}
                {!errors.worst_case && fieldValidation.worst_case?.message && formData.worst_case && (
                  <span className={`${styles.feedbackMessage} ${fieldValidation.worst_case.message.includes('✓') || fieldValidation.worst_case.message.includes('válido') ? styles.successMessage : styles.warningMessage}`}>
                    {fieldValidation.worst_case.message}
                  </span>
                )}
                <span className={styles.helpText}>
                  💡 Ejemplos: valores mínimos o condiciones no deseables
                </span>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Fórmula</h3>
              
              <div className={styles.field}>
                <label htmlFor="formula" className={`${styles.label} ${styles.required}`}>
                  Expresión Matemática
                </label>
                <textarea
                  id="formula"
                  value={formData.formula}
                  onChange={(e) => {
                    const newFormula = e.target.value;
                    setFormData(prev => ({ ...prev, formula: newFormula }));
                    if (errors.formula) {
                      setErrors(prev => ({ ...prev, formula: '' }));
                    }
                    validateFieldOnChange('formula', newFormula);
                  }}
                  onBlur={() => {
                    if (formData.formula.trim()) {
                      syncVariablesWithFormula(formData.formula);
                    }
                  }}
                  className={`${styles.textarea} ${styles.formula} ${errors.formula ? styles.error : ''}`}
                  rows={3}
                  placeholder="Ej: A/B, 1-(A/B), (A+B)/C"
                />
                {errors.formula && (
                  <span className={styles.fieldError}>{errors.formula}</span>
                )}
                {!errors.formula && fieldValidation.formula?.message && (
                  <span className={`${styles.feedbackMessage} ${fieldValidation.formula.message.includes('✓') ? styles.successMessage : styles.warningMessage}`}>
                    {fieldValidation.formula.message}
                  </span>
                )}
                <span className={styles.helpText}>
                  💡 Use variables en MAYÚSCULAS (A, B, C, etc.) y operadores: +, -, *, /, ( )
                </span>
              </div>

              {formData.formula.trim() && (
                <button
                  type="button"
                  onClick={() => syncVariablesWithFormula(formData.formula)}
                  className={styles.syncButton}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  🔄 Auto-generar variables desde fórmula
                </button>
              )}

              <div className={styles.variablesSection}>
                <div className={styles.variablesHeader}>
                  <h4 className={styles.variablesTitle}>Variables Definidas</h4>
                  <button
                    type="button"
                    onClick={addVariable}
                    className={styles.addButton}
                    disabled={!formData.formula.trim()}
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

                {/* Mensaje de estado de validación de variables */}
                {formData.formula.trim() && (
                  <div style={{ marginBottom: '1rem' }}>
                    {(() => {
                      const requiredVars = extractVariablesFromFormula(formData.formula);
                      const variablesValidation = validateVariablesMatchFormula(formData.formula, formData.variables);
                      
                      if (requiredVars.length === 0) {
                        return (
                          <div className={styles.infoBox} style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
                            ⚠️ La fórmula no contiene variables válidas (use MAYÚSCULAS: A, B, C)
                          </div>
                        );
                      }

                      if (variablesValidation.valid) {
                        return (
                          <div className={styles.infoBox} style={{ backgroundColor: '#d1fae5', border: '1px solid #a7f3d0' }}>
                            {variablesValidation.success}
                          </div>
                        );
                      }

                      return (
                        <div className={styles.infoBox} style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}>
                          ❌ {variablesValidation.error}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {!formData.formula.trim() && (
                  <div className={styles.infoBox} style={{ marginBottom: '1rem' }}>
                    💡 Primero defina la fórmula para saber qué variables necesita
                  </div>
                )}

                {errors.variables && (
                  <div className={styles.errorMessage} style={{ marginBottom: '1rem' }}>
                    {errors.variables}
                  </div>
                )}

                {!metric && !showAutocomplete && formData.variables.length > 0 && (
                  <div className={styles.infoBox} style={{ marginBottom: '1rem' }}>
                    <strong>✅ Variables importadas:</strong> Se copiaron {formData.variables.length} variable{formData.variables.length === 1 ? '' : 's'} de la métrica seleccionada.
                  </div>
                )}

                {formData.variables.length === 0 ? (
                  <div className={styles.emptyVariables}>
                    <p>No hay variables definidas. Agrega variables para usar en la fórmula.</p>
                  </div>
                ) : (
                  <div className={styles.variablesList}>
                    {formData.variables.map((variable, index) => (
                      <div key={variable.id || variable.tempId || index} className={styles.variableItem}>
                        <div className={styles.variableFields}>
                          <div className={styles.field}>
                            <input
                              type="text"
                              value={variable.symbol}
                              onChange={(e) => updateVariable(index, 'symbol', e.target.value)}
                              className={`${styles.input} ${styles.symbolInput} ${(() => {
                                const errorKey = `variable-symbol-${index}`;
                                return errors[errorKey] ? styles.error : '';
                              })()}`}
                              placeholder="Símbolo (ej: N_EXITO)"
                            />
                            {(() => {
                              const errorKey = `variable-symbol-${index}`;
                              return errors[errorKey] && (
                                <span className={styles.fieldError}>{errors[errorKey]}</span>
                              );
                            })()}
                          </div>
                          
                          <div className={styles.field}>
                            <input
                              type="text"
                              value={variable.description}
                              onChange={(e) => updateVariable(index, 'description', e.target.value)}
                              className={`${styles.input} ${styles.descriptionInput} ${(() => {
                                const errorKey = `variable-description-${index}`;
                                return errors[errorKey] ? styles.error : '';
                              })()}`}
                              placeholder="Descripción (ej: Número de casos exitosos)"
                            />
                            {(() => {
                              const errorKey = `variable-description-${index}`;
                              return errors[errorKey] && (
                                <span className={styles.fieldError}>{errors[errorKey]}</span>
                              );
                            })()}
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
                        <span key={variable.id || variable.tempId || `var-${index}`} className={styles.variableChip}>
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
            >
              {metric ? 'Actualizar Métrica' : 'Crear Métrica'}
            </Button>
          </div>
        </form>
      </div>
    </div>
    </>
  );

  // Renderizar en el body usando Portal para escapar del contenedor "shifted"
  return mounted ? createPortal(drawerContent, document.body) : null;
}