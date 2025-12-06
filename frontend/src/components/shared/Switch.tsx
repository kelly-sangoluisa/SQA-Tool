import React from 'react';
import styles from './Switch.module.css';

interface SwitchProps {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly disabled?: boolean;
  readonly title?: string;
  readonly size?: 'small' | 'medium';
}

export function Switch({ 
  checked, 
  onChange, 
  disabled = false, 
  title,
  size = 'medium'
}: SwitchProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${styles.toggleButton} ${checked ? styles.active : styles.inactive} ${styles[size]}`}
      disabled={disabled}
      title={title}
      aria-checked={checked}
      role="switch"
    >
      <div className={styles.toggleSlider}></div>
    </button>
  );
}
