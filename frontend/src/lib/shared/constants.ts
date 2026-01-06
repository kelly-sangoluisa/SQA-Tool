/**
 * Constantes centralizadas para la aplicación
 */

// Score ranges para evaluación de calidad (escala 0-10)
export const SCORE_RANGES = {
  EXCELLENT: 8,
  GOOD: 6,
  POOR: 0,
} as const;

// Colores para scores
export const SCORE_COLORS = {
  EXCELLENT: '#10b981', // Verde
  GOOD: '#f59e0b',      // Amarillo
  POOR: '#ef4444',      // Rojo
  LIGHT: 'var(--color-light)',
} as const;

// Estados de proyecto
export const PROJECT_STATUS = {
  COMPLETED: 'completed',
  IN_PROGRESS: 'in_progress',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
} as const;

// Labels para estados de proyecto
export const PROJECT_STATUS_LABELS: Record<string, string> = {
  [PROJECT_STATUS.COMPLETED]: 'Completado',
  [PROJECT_STATUS.IN_PROGRESS]: 'En Progreso',
  [PROJECT_STATUS.PENDING]: 'Pendiente',
  [PROJECT_STATUS.CANCELLED]: 'Cancelado',
} as const;

// Colores para estados de proyecto
export const PROJECT_STATUS_COLORS: Record<string, string> = {
  [PROJECT_STATUS.COMPLETED]: SCORE_COLORS.EXCELLENT,
  [PROJECT_STATUS.IN_PROGRESS]: SCORE_COLORS.GOOD,
  [PROJECT_STATUS.PENDING]: '#6b7280',
  [PROJECT_STATUS.CANCELLED]: SCORE_COLORS.POOR,
} as const;

// Labels para niveles de score
export const SCORE_LABELS: Record<string, string> = {
  EXCELLENT: 'Excelente',
  GOOD: 'Bueno',
  POOR: 'Necesita mejora',
  PENDING: 'Pendiente',
  NO_DATA: 'Sin datos',
} as const;

// Configuración para lazy loading
export const PAGINATION = {
  PROJECTS_PER_PAGE: 9,
  EVALUATIONS_PER_PAGE: 6,
  INTERSECTION_THRESHOLD: 0.1,
} as const;
