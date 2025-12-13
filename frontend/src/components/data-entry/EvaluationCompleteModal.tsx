'use client';

import { useState } from 'react';
import styles from './EvaluationCompleteModal.module.css';

interface Variable {
  metric_name: string;
  variable_symbol: string;
  variable_value: string;
}

interface EvaluationCompleteModalProps {
  isOpen: boolean;
  evaluationName: string;
  isLastEvaluation: boolean;
  completedMetrics: number;
  totalMetrics: number;
  variables: Variable[];
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function EvaluationCompleteModal({
  isOpen,
  evaluationName,
  isLastEvaluation,
  completedMetrics,
  totalMetrics,
  variables,
  onConfirm,
  onCancel,
  loading = false
}: EvaluationCompleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            {isLastEvaluation ? (
              <svg className={styles.iconSuccess} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className={styles.iconInfo} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <h2 className={styles.title}>
            {isLastEvaluation ? '¡Proyecto Completo!' : 'Evaluación Completada'}
          </h2>
          <p className={styles.subtitle}>
            {isLastEvaluation 
              ? 'Has completado todas las evaluaciones del proyecto' 
              : `Evaluación: ${evaluationName}`}
          </p>
        </div>

        {/* Progress */}
        <div className={styles.progress}>
          <div className={styles.progressStats}>
            <span className={styles.progressLabel}>Métricas completadas</span>
            <span className={styles.progressValue}>{completedMetrics} / {totalMetrics}</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressBarFill} 
              style={{ width: `${(completedMetrics / totalMetrics) * 100}%` }}
            />
          </div>
        </div>

        {/* Variables Summary */}
        <div className={styles.content}>
          <h3 className={styles.sectionTitle}>Resumen de datos ingresados</h3>
          <div className={styles.variablesList}>
            {variables.slice(0, 10).map((variable, index) => (
              <div key={index} className={styles.variableItem}>
                <div className={styles.variableInfo}>
                  <span className={styles.metricName}>{variable.metric_name}</span>
                  <span className={styles.variableSymbol}>{variable.variable_symbol}</span>
                </div>
                <span className={styles.variableValue}>{variable.variable_value}</span>
              </div>
            ))}
            {variables.length > 10 && (
              <div className={styles.moreVariables}>
                + {variables.length - 10} variables más
              </div>
            )}
          </div>
        </div>

        {/* Warning */}
        {isLastEvaluation && (
          <div className={styles.warning}>
            <svg className={styles.warningIcon} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>Al finalizar el proyecto se calcularán todos los resultados. Esta acción no se puede deshacer.</p>
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <button 
            className={styles.cancelButton} 
            onClick={onCancel}
            disabled={loading}
          >
            Regresar
          </button>
          <button 
            className={styles.confirmButton} 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Procesando...
              </>
            ) : isLastEvaluation ? (
              'Terminar y Ver Resultados'
            ) : (
              'Continuar a Siguiente Evaluación'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
