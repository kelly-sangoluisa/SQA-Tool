import React, { useState, useEffect } from 'react';
import styles from './FormField.module.css';

const ErrorIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7 3V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="7" cy="10" r="0.5" fill="currentColor"/>
  </svg>
);

const WarningIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1L13 12H1L7 1Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M7 5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="7" cy="10.5" r="0.5" fill="currentColor"/>
  </svg>
);

const SuccessIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M4 7L6 9L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
  success?: string;
}

interface ValidatedFormFieldProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly maxLength?: number;
  readonly type?: 'text' | 'textarea';
  readonly rows?: number;
  readonly helperText?: string;
  readonly validateFn?: (value: string) => ValidationResult;
  readonly validateOnChange?: boolean; // Validar mientras escribe
  readonly showCharCount?: boolean;
}

export function ValidatedFormField({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  required,
  type = 'text',
  rows = 3,
  maxLength = 100,
  helperText,
  validateFn,
  validateOnChange = true,
  showCharCount = true
}: ValidatedFormFieldProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult>({ valid: true });
  const [touched, setTouched] = useState(false);

  // Validar cuando cambia el valor
  useEffect(() => {
    if (validateFn && (validateOnChange || touched)) {
      const result = validateFn(value);
      setValidationResult(result);
    }
  }, [value, validateFn, validateOnChange, touched]);

  const handleChange = (newValue: string) => {
    onChange(newValue);
    if (!touched) {
      setTouched(true);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (validateFn) {
      const result = validateFn(value);
      setValidationResult(result);
    }
  };

  const warningThreshold = maxLength * 0.8;
  const criticalThreshold = maxLength * 0.95;
  const isLengthWarning = value.length > warningThreshold;
  const isLengthCritical = value.length > criticalThreshold;

  const hasError = validationResult.error;
  const hasWarning = validationResult.warning;
  const hasSuccess = validationResult.success && touched && value.trim().length > 0;

  const feedbackMessage = validationResult.error || validationResult.warning || validationResult.success;
  const feedbackType = hasError ? 'error' : hasWarning ? 'warning' : hasSuccess ? 'success' : null;

  return (
    <div className={styles.field}>
      <label 
        htmlFor={id} 
        className={`${styles.label} ${required ? styles.required : ''}`}
      >
        {label}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          className={`${styles.textarea} ${hasError ? styles.error : ''} ${hasSuccess ? styles.success : ''}`}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={rows}
        />
      ) : (
        <input
          type="text"
          id={id}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          className={`${styles.input} ${hasError ? styles.error : ''} ${hasSuccess ? styles.success : ''}`}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
        />
      )}

      {/* Mensajes de retroalimentación */}
      {feedbackMessage && touched && (
        <div className={`${styles.feedback} ${styles[`feedback-${feedbackType}`]}`}>
          {feedbackType === 'error' && <ErrorIcon />}
          {feedbackType === 'warning' && <WarningIcon />}
          {feedbackType === 'success' && <SuccessIcon />}
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Texto de ayuda */}
      {helperText && !feedbackMessage && (
        <div className={styles.helperText}>
          {helperText}
        </div>
      )}

      {/* Contador de caracteres */}
      {showCharCount && (
        <div className={`${styles.characterCount} ${isLengthWarning ? styles.warning : ''} ${isLengthCritical ? styles.critical : ''}`}>
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
}
