import { ReactNode } from 'react';
import styles from './ResultsPageLayout.module.css';

interface ResultsPageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  backButton?: {
    label: string;
    onClick: () => void;
  };
  stats?: Array<{
    label: string;
    value: number | string;
    variant: 'total' | 'approved' | 'rejected' | 'pending' | 'completed';
  }>;
}

export function ResultsPageLayout({
  children,
  title,
  subtitle,
  backButton,
  stats
}: Readonly<ResultsPageLayoutProps>) {
  return (
    <div className={styles.resultsPage}>
      <div className={styles.pageHeader}>
        {backButton && (
          <button onClick={backButton.onClick} className={styles.backButton}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {backButton.label}
          </button>
        )}

        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>{title}</h1>
          {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}

          {stats && stats.length > 0 && (
            <div className={styles.statsSummary}>
              {stats.map((stat) => (
                <div key={stat.label} className={`${styles.statChip} ${styles[stat.variant]}`}>
                  <span className={styles.statNumber}>{stat.value}</span>
                  <span className={styles.statText}>{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
