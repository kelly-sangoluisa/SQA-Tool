'use client';

import { useState } from 'react';
import styles from './EvaluationSidebar.module.css';

interface Metric {
  number: number;
  name: string;
  description: string;
  formula: string;
  variables: Array<{
    symbol: string;
    description: string;
  }>;
}

interface Standard {
  standard: string;
  metrics: Metric[];
}

interface EvaluationSidebarProps {
  evaluationData: Standard[];
  activeStandard?: number;
  activeMetric?: number;
  onStandardClick?: (standardIndex: number) => void;
  onMetricClick?: (standardIndex: number, metricIndex: number) => void;
}

export function EvaluationSidebar({ 
  evaluationData, 
  activeStandard, 
  activeMetric, 
  onStandardClick, 
  onMetricClick 
}: Readonly<EvaluationSidebarProps>) {
  const [expandedStandards, setExpandedStandards] = useState<Set<number>>(new Set([0]));

  const toggleStandard = (index: number) => {
    const newExpanded = new Set(expandedStandards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedStandards(newExpanded);
    onStandardClick?.(index);
  };

  const handleMetricClick = (standardIndex: number, metricIndex: number) => {
    onMetricClick?.(standardIndex, metricIndex);
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.title}>EVALUACIÓN</h2>
      </div>
      
      <div className={styles.navigation}>
        {evaluationData.map((section, standardIndex) => (
          <div key={`standard-${section.standard}-${standardIndex}`} className={styles.standardGroup}>
            <button
              className={`${styles.standardButton} ${
                activeStandard === standardIndex ? styles.activeStandard : ''
              }`}
              onClick={() => toggleStandard(standardIndex)}
            >
              <span className={styles.standardIcon}>
                {expandedStandards.has(standardIndex) ? '▼' : '▶'}
              </span>
              <span className={styles.standardName}>{section.standard}</span>
            </button>
            
            {expandedStandards.has(standardIndex) && (
              <div className={styles.metricsContainer}>
                {section.metrics.map((metric, metricIndex) => (
                  <button
                    key={`metric-${metric.number}-${metricIndex}`}
                    className={`${styles.metricButton} ${
                      activeStandard === standardIndex && activeMetric === metricIndex 
                        ? styles.activeMetric 
                        : ''
                    }`}
                    onClick={() => handleMetricClick(standardIndex, metricIndex)}
                  >
                    <span className={styles.metricNumber}>{metric.number}</span>
                    <span className={styles.metricName}>{metric.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}