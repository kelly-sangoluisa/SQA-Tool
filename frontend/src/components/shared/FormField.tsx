import React from 'react';
import styles from './FormDrawer.module.css';

const ErrorIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7 3V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="7" cy="10" r="0.5" fill="currentColor"/>
  </svg>
);

interface FormFieldProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly error?: string;
  readonly required?: boolean;
  readonly maxLength?: number;
  readonly type?: 'text' | 'textarea';
}

export function FormField({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  error,
  required,
  type = 'text',
  maxLength = 100
}: FormFieldProps) {
  const warningThreshold = maxLength * 0.8;
  const criticalThreshold = maxLength * 0.95;
  const isWarning = value.length > warningThreshold;
  const isCritical = value.length > criticalThreshold;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={`${styles.label} ${required ? styles.required : ''}`}>
        {label}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${styles.textarea} ${error ? styles.error : ''}`}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
        />
      ) : (
        <input
          type="text"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${styles.input} ${error ? styles.error : ''}`}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
        />
      )}

      {error && (
        <div className={styles.errorMessage}>
          <ErrorIcon />
          {error}
        </div>
      )}

      <div className={`${styles.characterCount} ${isWarning ? styles.warning : ''} ${isCritical ? styles.error : ''}`}>
        {value.length}/{maxLength}
      </div>
    </div>
  );
}
