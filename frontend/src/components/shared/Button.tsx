import { ButtonHTMLAttributes, forwardRef } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const variantClass = styles[variant] || styles.primary;
    const sizeClass = styles[size] || styles.md;
    const classes = [styles.base, variantClass, sizeClass, isLoading ? styles.disabled : '', className].join(' ').trim();

    return (
      <button ref={ref} className={classes} disabled={disabled || isLoading} {...props}>
        {isLoading && <span className={styles.spinner} aria-hidden />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
