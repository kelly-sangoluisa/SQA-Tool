import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Metric, parameterizationApi, CreateMetricDto, UpdateMetricDto } from '../../api/parameterization/parameterization-api';
import { MetricSearchResult } from '../../types/parameterization-search.types';
import { Button } from '../shared/Button';
import { Autocomplete } from './Autocomplete';
import { Toast } from '../shared/Toast';
import { useToast } from '../../hooks/shared/useToast';
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

// Helper Components and Functions (extracted to reduce cognitive complexity)

interface NameFieldProps {
  readonly metric?: Metric | null;
  readonly showAutocomplete: boolean;
  readonly formData: FormData;
  readonly errors: Record<string, string>;
  readonly onFormDataChange: (updates: Partial<FormData>) => void;
  readonly onErrorsClear: (field: string) => void;
  readonly onMetricSelected: (selectedMetric: MetricSearchResult) => void;
  readonly onToggleAutocomplete: (show: boolean) => void;
}

function NameField({ 
  metric, 
  showAutocomplete, 
  formData, 
  errors,
  onFormDataChange,
  onErrorsClear,
  onMetricSelected,
  onToggleAutocomplete
}: NameFieldProps) {
  const shouldShowAutocomplete = !metric && showAutocomplete;
  
  return (
    <div className={styles.field}>
      <label htmlFor="name" className={`${styles.label} ${styles.required}`}>
        Nombre {!metric && '(Búsqueda inteligente)'}
      </label>
      {shouldShowAutocomplete ? (
        <Autocomplete
          value={formData.name}
          onChange={(value) => onFormDataChange({ name: value })}
          onSelect={onMetricSelected}
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
            onFormDataChange({ name: e.target.value });
            if (errors.name) {
              onErrorsClear('name');
            }
          }}
          className={`${styles.input} ${errors.name ? styles.error : ''}`}
          placeholder="Ej: Porcentaje de éxito"
        />
      )}
      {!metric && !showAutocomplete && (
        <button
          type="button"
          onClick={() => onToggleAutocomplete(true)}
          className={styles.linkButton}
        >
          🔍 Buscar métrica existente
        </button>
      )}
      {!showAutocomplete && errors.name && <span className={styles.fieldError}>{errors.name}</span>}
    </div>
  );
}

interface VariableValidationMessageProps {
  readonly formula: string;
  readonly variables: FormData['variables'];
}

function VariableValidationMessage({ formula, variables }: VariableValidationMessageProps) {
  if (!formula.trim()) {
    return null;
  }

  const requiredVars = extractVariablesFromFormula(formula);
  const variablesValidation = validateVariablesMatchFormula(formula, variables);
  
  let type: 'warning' | 'success' | 'error';
  let message: string;

  if (requiredVars.length === 0) {
    type = 'warning';
    message = '⚠️ La fórmula no contiene variables válidas (use MAYÚSCULAS: A, B, C)';
  } else if (variablesValidation.valid) {
    type = 'success';
    message = variablesValidation.success!;
  } else {
    type = 'error';
    message = `❌ ${variablesValidation.error}`;
  }

  const styles_map = {
    warning: { bg: '#fef3c7', border: '#fde68a' },
    success: { bg: '#d1fae5', border: '#a7f3d0' },
    error: { bg: '#fee2e2', border: '#fecaca' }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div 
        className={styles.infoBox} 
        style={{ 
          backgroundColor: styles_map[type].bg, 
          border: `1px solid ${styles_map[type].border}` 
        }}
      >
        {message}
      </div>
    </div>
  );
}

interface VariableItemProps {
  readonly variable: FormData['variables'][0];
  readonly index: number;
  readonly errors: Record<string, string>;
  readonly onUpdate: (index: number, field: 'symbol' | 'description', value: string) => void;
  readonly onRemove: (index: number) => void;
}

function VariableItem({ variable, index, errors, onUpdate, onRemove }: VariableItemProps) {
  const symbolErrorKey = `variable-symbol-${index}`;
  const descErrorKey = `variable-description-${index}`;
  
  return (
    <div key={variable.id || variable.tempId || index} className={styles.variableItem}>
      <div className={styles.variableFields}>
        <div className={styles.field}>
          <input
            type="text"
            value={variable.symbol}
            onChange={(e) => onUpdate(index, 'symbol', e.target.value)}
            className={`${styles.input} ${styles.symbolInput} ${errors[symbolErrorKey] ? styles.error : ''}`}
            placeholder="Símbolo (ej: N_EXITO)"
          />
          {errors[symbolErrorKey] && <span className={styles.fieldError}>{errors[symbolErrorKey]}</span>}
        </div>
        
        <div className={styles.field}>
          <input
            type="text"
            value={variable.description}
            onChange={(e) => onUpdate(index, 'description', e.target.value)}
            className={`${styles.input} ${styles.descriptionInput} ${errors[descErrorKey] ? styles.error : ''}`}
            placeholder="Descripción (ej: Número de casos exitosos)"
          />
          {errors[descErrorKey] && <span className={styles.fieldError}>{errors[descErrorKey]}</span>}
        </div>
      </div>
      
      <button
        type="button"
        onClick={() => onRemove(index)}
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
  );
}

interface ThresholdFieldProps {
  readonly label: string;
  readonly id: string;
  readonly value: string;
  readonly error?: string;
  readonly validation?: { valid: boolean; message?: string };
  readonly placeholder: string;
  readonly helpText: string;
  readonly onChange: (value: string) => void;
  readonly onValidate: (value: string) => void;
}

function ThresholdField({
  label,
  id,
  value,
  error,
  validation,
  placeholder,
  helpText,
  onChange,
  onValidate
}: ThresholdFieldProps) {
  const hasSuccess = !error && validation?.valid && value;
  const hasValidationMessage = !error && validation?.message && value;
  const isSuccessMessage = validation?.message?.includes('✓') || validation?.message?.includes('válido');

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={`${styles.label} ${styles.required}`}>
        {label}
      </label>
      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          onValidate(e.target.value);
        }}
        className={`${styles.input} ${error ? styles.error : ''} ${hasSuccess ? styles.success : ''}`}
        placeholder={placeholder}
      />
      {error && <span className={styles.fieldError}>{error}</span>}
      {hasValidationMessage && (
        <span className={`${styles.feedbackMessage} ${isSuccessMessage ? styles.successMessage : styles.warningMessage}`}>
          {validation.message}
        </span>
      )}
      <span className={styles.helpText}>{helpText}</span>
    </div>
  );
}

interface FormulaFieldProps {
  readonly value: string;
  readonly error?: string;
  readonly validation?: { valid: boolean; message?: string };
  readonly onChange: (value: string) => void;
  readonly onValidate: (value: string) => void;
  readonly onBlur: () => void;
}

function FormulaField({ value, error, validation, onChange, onValidate, onBlur }: FormulaFieldProps) {
  const hasValidationMessage = !error && validation?.message;
  const isSuccessMessage = validation?.message?.includes('✓');

  return (
    <div className={styles.field}>
      <label htmlFor="formula" className={`${styles.label} ${styles.required}`}>
        Expresión Matemática
      </label>
      <textarea
        id="formula"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          onValidate(e.target.value);
        }}
        onBlur={onBlur}
        className={`${styles.textarea} ${styles.formula} ${error ? styles.error : ''}`}
        rows={3}
        placeholder="Ej: A/B, 1-(A/B), (A+B)/C"
      />
      {error && <span className={styles.fieldError}>{error}</span>}
      {hasValidationMessage && (
        <span className={`${styles.feedbackMessage} ${isSuccessMessage ? styles.successMessage : styles.warningMessage}`}>
          {validation.message}
        </span>
      )}
      <span className={styles.helpText}>
        💡 Use variables en MAYÚSCULAS (A, B, C, etc.) y operadores: +, -, *, /, ( )
      </span>
    </div>
  );
}

// Custom hook for form logic
function useMetricForm(metric: Metric | null | undefined, subCriterionId: number | undefined) {
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
  const [tempIdCounter, setTempIdCounter] = useState(0);

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

  const updateExistingMetric = async (metricToUpdate: Metric) => {
    const updateData: UpdateMetricDto = {
      name: formData.name,
      description: formData.description || undefined,
      code: formData.code || undefined,
      formula: formData.formula || undefined,
      desired_threshold: formData.desired_threshold || undefined,
      worst_case: formData.worst_case || undefined
    };
    
    await parameterizationApi.updateMetric(metricToUpdate.id, updateData);

    const existingVariableIds = new Set(metricToUpdate.variables?.map(v => v.id) || []);
    
    const variablesToUpdate = formData.variables.filter((v): v is typeof v & { id: number } => 
      typeof v.id === 'number' && existingVariableIds.has(v.id)
    );
    await Promise.all(
      variablesToUpdate.map(v =>
        parameterizationApi.updateVariable(v.id, {
          symbol: v.symbol,
          description: v.description,
          metric_id: metricToUpdate.id
        })
      )
    );

    const variablesToCreate = formData.variables.filter(v => !v.id);
    await Promise.all(
      variablesToCreate.map(v =>
        parameterizationApi.createVariable({
          symbol: v.symbol,
          description: v.description,
          metric_id: metricToUpdate.id
        })
      )
    );
  };

  const createNewMetric = async () => {
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
  };

  const syncVariablesWithFormula = (formula: string) => {
    if (!formula.trim()) return;

    const requiredVars = extractVariablesFromFormula(formula);
    const currentSymbols = formData.variables.map(v => v.symbol.trim()).filter(s => s.length > 0);
    
    const symbolsMatch = JSON.stringify(requiredVars.toSorted((a, b) => a.localeCompare(b))) === JSON.stringify(currentSymbols.toSorted((a, b) => a.localeCompare(b)));
    
    if (symbolsMatch) return;

    const newVariables = requiredVars.map((symbol, idx) => {
      const existing = formData.variables.find(v => v.symbol === symbol);
      return existing || {
        symbol,
        description: '',
        tempId: `temp-formula-${Date.now()}-${idx}`
      };
    });

    setFormData(prev => ({ ...prev, variables: newVariables }));
  };

  const addVariable = () => {
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

  const removeVariable = async (index: number) => {
    const variableToRemove = formData.variables[index];
    
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
    
    if (variableToRemove.id) {
      try {
        await parameterizationApi.deleteVariable(variableToRemove.id);
      } catch (error) {
        console.error('Error al eliminar variable:', error);
        setErrors({ general: `Error al eliminar la variable "${variableToRemove.symbol}"` });
        
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

  return {
    formData,
    setFormData,
    loading,
    setLoading,
    errors,
    setErrors,
    fieldValidation,
    setFieldValidation,
    tempIdCounter,
    setTempIdCounter,
    validateForm,
    updateExistingMetric,
    createNewMetric,
    syncVariablesWithFormula,
    addVariable,
    removeVariable
  };
}

export function MetricFormDrawer({ metric, subCriterionId, onClose, onSave }: MetricFormDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(true);
  
  const { toast, showToast, hideToast } = useToast();
  
  const {
    formData,
    setFormData,
    loading,
    setLoading,
    errors,
    setErrors,
    fieldValidation,
    setFieldValidation,
    validateForm,
    updateExistingMetric,
    createNewMetric,
    syncVariablesWithFormula,
    addVariable,
    removeVariable
  } = useMetricForm(metric, subCriterionId);

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
          id: v.id,
          symbol: v.symbol,
          description: v.description
        })) || []
      });
      setShowAutocomplete(false);
    }
  }, [metric, setFormData]);

  const handleMetricSelected = (selectedMetric: MetricSearchResult) => {
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

    setShowAutocomplete(false);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (metric) {
        await updateExistingMetric(metric);
      } else {
        await createNewMetric();
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
    setTimeout(onClose, 300);
  };

  const updateVariable = (index: number, field: 'symbol' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      )
    }));
  };

  const handleFormDataChange = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleErrorsClear = (field: string) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
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
                <NameField
                  metric={metric}
                  showAutocomplete={showAutocomplete}
                  formData={formData}
                  errors={errors}
                  onFormDataChange={handleFormDataChange}
                  onErrorsClear={handleErrorsClear}
                  onMetricSelected={handleMetricSelected}
                  onToggleAutocomplete={setShowAutocomplete}
                />

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

              <ThresholdField
                label="Umbral Deseado"
                id="threshold"
                value={formData.desired_threshold}
                error={errors.desired_threshold}
                validation={fieldValidation.desired_threshold}
                placeholder="Ej: 0, 1, >=10/3min, 20 min, 0%, 0 seg, 0/1min"
                helpText="💡 Ejemplos: numéricos (0, 1), comparadores (>=10/3min), unidades (20 min, 0%, 0 seg)"
                onChange={(value) => {
                  setFormData(prev => ({ ...prev, desired_threshold: value }));
                  if (errors.desired_threshold) {
                    setErrors(prev => ({ ...prev, desired_threshold: '' }));
                  }
                }}
                onValidate={(value) => validateFieldOnChange('desired_threshold', value)}
              />

              <ThresholdField
                label="Peor Caso"
                id="worstCase"
                value={formData.worst_case}
                error={errors.worst_case}
                validation={fieldValidation.worst_case}
                placeholder="Ej: 0, 1, 0/3min, >20 min, >=10%, >= 15 seg, >=4"
                helpText="💡 Ejemplos: valores mínimos o condiciones no deseables"
                onChange={(value) => {
                  setFormData(prev => ({ ...prev, worst_case: value }));
                  if (errors.worst_case) {
                    setErrors(prev => ({ ...prev, worst_case: '' }));
                  }
                }}
                onValidate={(value) => validateFieldOnChange('worst_case', value)}
              />
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Fórmula</h3>
              
              <FormulaField
                value={formData.formula}
                error={errors.formula}
                validation={fieldValidation.formula}
                onChange={(value) => {
                  setFormData(prev => ({ ...prev, formula: value }));
                  if (errors.formula) {
                    setErrors(prev => ({ ...prev, formula: '' }));
                  }
                }}
                onValidate={(value) => validateFieldOnChange('formula', value)}
                onBlur={() => {
                  if (formData.formula.trim()) {
                    syncVariablesWithFormula(formData.formula);
                  }
                }}
              />

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
                <VariableValidationMessage formula={formData.formula} variables={formData.variables} />

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
                      <VariableItem
                        key={variable.id || variable.tempId || index}
                        variable={variable}
                        index={index}
                        errors={errors}
                        onUpdate={updateVariable}
                        onRemove={removeVariable}
                      />
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