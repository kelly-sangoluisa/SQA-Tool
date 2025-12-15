import React from 'react';
import Link from 'next/link';
import type { DashboardProject } from '../types';
import { formatDate } from '../utils/formatters';
import styles from '../DashboardSidebar.module.css';

interface ProjectListItemProps {
  project: DashboardProject;
}

export function ProjectListItem({ project }: ProjectListItemProps) {
  const getStatusInfo = () => {
    if (project.final_project_score === null) {
      return { label: 'En progreso', className: styles.statusInProgress };
    }
    return project.meets_threshold
      ? { label: 'Aprobado', className: styles.statusCompleted }
      : { label: 'Rechazado', className: styles.statusCancelled };
  };

  const statusInfo = getStatusInfo();

  return (
    <li className={styles.item}>
      <Link 
        href={`/results/project/${project.project_id}`}
        className={styles.itemLink}
      >
        <div className={styles.itemHeader}>
          <span className={styles.itemName}>{project.project_name}</span>
          <span className={statusInfo.className}>
            {statusInfo.label}
          </span>
        </div>
        <div className={styles.itemDate}>
          {formatDate(project.updated_at)}
        </div>
      </Link>
    </li>
  );
}
