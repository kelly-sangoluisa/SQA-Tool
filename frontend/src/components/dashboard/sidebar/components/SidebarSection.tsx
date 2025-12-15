import React from 'react';
import Link from 'next/link';
import { IconType } from 'react-icons';
import styles from '../DashboardSidebar.module.css';

interface SidebarSectionProps {
  title: string;
  icon: IconType;
  viewAllLink?: string;
  viewAllText?: string;
  loading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}

export function SidebarSection({
  title,
  icon: Icon,
  viewAllLink,
  viewAllText,
  loading = false,
  isEmpty = false,
  emptyMessage = 'No hay elementos',
  children
}: SidebarSectionProps) {
  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>
        <Icon className={styles.titleIcon} size={18} />
        <span>{title}</span>
      </h3>
      
      {loading ? (
        <div className={styles.loading}>Cargando...</div>
      ) : (
        <>
          {isEmpty ? (
            <div className={styles.empty}>{emptyMessage}</div>
          ) : (
            <ul className={styles.itemList}>
              {children}
            </ul>
          )}
          {viewAllLink && viewAllText && (
            <Link href={viewAllLink} className={styles.viewAllLink}>
              {viewAllText}
            </Link>
          )}
        </>
      )}
    </section>
  );
}
