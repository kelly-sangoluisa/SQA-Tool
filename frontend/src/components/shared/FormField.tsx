import React from 'react';
import styles from './FormDrawer.module.css';

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  maxLength?: number;
  type?: 'text' | 'textarea';
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

  const ErrorIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 3V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="7" cy="10" r="0.5" fill="currentColor"/>
    </svg>
  );

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
