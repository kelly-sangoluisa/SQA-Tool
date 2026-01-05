import React from 'react';
import styles from './ProjectCardSkeleton.module.css';

export function ProjectCardSkeleton() {
  return (
    <article className={styles.skeletonCard} aria-label="Cargando proyecto">
      <h4 className={styles.visuallyHidden}>Cargando proyecto</h4>
      <div className={styles.skeletonIcon} />
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonDesc} />
        <div className={styles.skeletonFooter}>
          <div className={styles.skeletonDate} />
          <div className={styles.skeletonButton} />
        </div>
      </div>
    </article>
  );
}

export function ProjectCardSkeletonSmall() {
  return (
    <article className={styles.skeletonCardSmall} aria-label="Cargando proyecto">
      <h4 className={styles.visuallyHidden}>Cargando proyecto</h4>
      <div className={styles.skeletonIconSmall} />
      <div className={styles.skeletonContentSmall}>
        <div className={styles.skeletonTitleSmall} />
        <div className={styles.skeletonDescSmall} />
      </div>
      <div className={styles.skeletonButtonSmall} />
    </article>
  );
}
