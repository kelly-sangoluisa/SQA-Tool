import React from 'react';
import Link from 'next/link';
import type { DashboardProject } from '../types';
import { formatDate } from '../utils/formatters';
import styles from '../DashboardSidebar.module.css';

interface ProjectListItemProps {
<<<<<<< HEAD
  project: DashboardProject;
=======
  project: Project;
  linkTo?: string;
>>>>>>> 7b19fc67af1d22e9da8bd04aa3e0d409483e7d44
}

export function ProjectListItem({ project, linkTo }: ProjectListItemProps) {
  const getStatusInfo = () => {
    if (project.final_project_score === null) {
      return { label: 'En progreso', className: styles.statusInProgress };
    }
    return project.meets_threshold
      ? { label: 'Aprobado', className: styles.statusCompleted }
      : { label: 'Rechazado', className: styles.statusCancelled };
  };

  const statusInfo = getStatusInfo();
  const defaultLink = `/results/project/${project.project_id}`;

  return (
    <li className={styles.item}>
      <Link 
        href={linkTo || defaultLink}
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
