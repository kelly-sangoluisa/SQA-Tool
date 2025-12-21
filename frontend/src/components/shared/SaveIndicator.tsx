import { FaSave } from 'react-icons/fa';
import styles from './SaveIndicator.module.css';

interface SaveIndicatorProps {
  readonly isVisible: boolean;
}

export function SaveIndicator({ isVisible }: SaveIndicatorProps) {
  if (!isVisible) return null;

  return (
    <output 
      className={styles.saveIndicator}
      aria-live="polite"
      aria-atomic="true"
      aria-label="Guardando datos en progreso"
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        className={styles.spinner}
        aria-hidden="true"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <FaSave className={styles.saveIcon} /> Guardando datos...
    </output>
  );
}
