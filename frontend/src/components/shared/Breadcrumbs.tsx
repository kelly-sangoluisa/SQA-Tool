import React from 'react';
import styles from './Breadcrumbs.module.css';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav className={`${styles.breadcrumbs} ${className}`} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {items.map((item, index) => (
          <li key={index} className={styles.item}>
            {item.onClick && !item.isActive ? (
              <button
                type="button"
                onClick={item.onClick}
                className={styles.link}
                aria-current={item.isActive ? 'page' : undefined}
              >
                {item.label}
              </button>
            ) : (
              <span
                className={`${styles.text} ${item.isActive ? styles.active : ''}`}
                aria-current={item.isActive ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
            
            {index < items.length - 1 && (
              <svg 
                className={styles.separator} 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none"
                aria-hidden="true"
              >
                <path 
                  d="M6 12L10 8L6 4" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}