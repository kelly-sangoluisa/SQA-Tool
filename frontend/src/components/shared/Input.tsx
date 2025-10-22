import { InputHTMLAttributes, forwardRef } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, type = 'text', className = '', ...props }, ref) => {
    const inputClass = `${styles.input} ${error ? styles.errorInput : ''} ${className}`.trim();

    return (
      <div className={styles.root}>
        {label && <label className={styles.label}>{label}</label>}
        <input ref={ref} type={type} className={inputClass} {...props} />
        {error && <p className={styles.error}>{error}</p>}
        {helperText && !error && <p className={styles.helper}>{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
