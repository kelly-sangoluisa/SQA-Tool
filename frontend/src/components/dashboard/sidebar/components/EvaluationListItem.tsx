import React from 'react';
import Link from 'next/link';
import type { DashboardEvaluation } from '../types';
import { formatDate } from '../utils/formatters';
import styles from '../DashboardSidebar.module.css';

interface EvaluationListItemProps {
  evaluation: DashboardEvaluation;
}

export function EvaluationListItem({ evaluation }: EvaluationListItemProps) {
  const getStatusInfo = () => {
    if (!evaluation.has_results) {
      return { label: 'Pendiente', className: styles.statusInProgress };
    }
    return { label: 'Completada', className: styles.statusCompleted };
  };

  const statusInfo = getStatusInfo();

  return (
    <li className={styles.item}>
      <Link 
        href={`/results/${evaluation.evaluation_id}`}
        className={styles.itemLink}
      >
        <div className={styles.itemHeader}>
          <span className={styles.itemName}>{evaluation.standard_name}</span>
          <span className={statusInfo.className}>
            {statusInfo.label}
          </span>
        </div>
        <div className={styles.itemMeta}>
          <span className={styles.itemStandard}>{evaluation.project_name}</span>
          <span className={styles.itemDate}>
            {formatDate(evaluation.updated_at || evaluation.created_at)}
          </span>
        </div>
      </Link>
    </li>
  );
}
