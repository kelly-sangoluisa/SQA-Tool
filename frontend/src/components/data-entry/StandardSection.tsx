import { ReactNode } from 'react';
import styles from './StandardSection.module.css';

interface StandardSectionProps {
  title: string;
  children: ReactNode;
}

export function StandardSection({ title, children }: Readonly<StandardSectionProps>) {
  return (
    <div className={styles.standardSection}>
      <div className={styles.header}>
        {title}
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}