/**
 * Enumeraciones para clasificación de puntuaciones
 */

/**
 * Nivel de puntuación del proyecto/evaluación
 * Basado en rangos adaptativos según minimum_threshold
 */
export enum ScoreLevel {
  UNACCEPTABLE = 'Inaceptable',
  MINIMALLY_ACCEPTABLE = 'Mínimamente Aceptable',
  TARGET_RANGE = 'Rango Objetivo',
  EXCEEDS_REQUIREMENTS = 'Excede los Requisitos',
}

/**
 * Grado de satisfacción del proyecto/evaluación
 * Basado en rangos adaptativos según minimum_threshold
 */
export enum SatisfactionGrade {
  UNSATISFACTORY = 'Insatisfactorio',
  SATISFACTORY = 'Satisfactorio',
  VERY_SATISFACTORY = 'Muy Satisfactorio',
}
