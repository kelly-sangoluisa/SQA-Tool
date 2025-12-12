/**
 * Funciones de formateo y utilidades compartidas
 */

import { 
  SCORE_RANGES, 
  SCORE_COLORS, 
  SCORE_LABELS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS 
} from './constants';

/**
 * Formatea una fecha a formato legible en español
 * @param dateString - String ISO de fecha
 * @param format - 'short' para formato corto, 'long' para formato completo
 */
export function formatDate(dateString: string, format: 'short' | 'long' = 'long'): string {
  const date = new Date(dateString);
  
  if (format === 'short') {
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    });
  }
  
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Obtiene el color correspondiente a un score
 */
export function getScoreColor(score: number | null): string {
  if (score === null) return SCORE_COLORS.LIGHT;
  if (score >= SCORE_RANGES.EXCELLENT) return SCORE_COLORS.EXCELLENT;
  if (score >= SCORE_RANGES.GOOD) return SCORE_COLORS.GOOD;
  return SCORE_COLORS.POOR;
}

/**
 * Obtiene el label correspondiente a un score
 */
export function getScoreLabel(score: number | null): string {
  if (score === null) return SCORE_LABELS.PENDING;
  if (score >= SCORE_RANGES.EXCELLENT) return SCORE_LABELS.EXCELLENT;
  if (score >= SCORE_RANGES.GOOD) return SCORE_LABELS.GOOD;
  return SCORE_LABELS.POOR;
}

/**
 * Obtiene el label de estado de un proyecto
 */
export function getStatusLabel(status: string): string {
  return PROJECT_STATUS_LABELS[status] || status;
}

/**
 * Obtiene el color de estado de un proyecto
 */
export function getStatusColor(status: string): string {
  return PROJECT_STATUS_COLORS[status] || '#6b7280';
}

/**
 * Valida que un número sea válido y retorna 0 si no lo es
 */
export function validateScore(score: number | null | undefined): number {
  return typeof score === 'number' && !isNaN(score) ? score : 0;
}

/**
 * Trunca un texto a un largo máximo con ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
