import { Injectable, Logger } from '@nestjs/common';
import { ScoreLevel, SatisfactionGrade } from '../../../common/decorators/score-classification.enum';

/**
 * Servicio para clasificar puntuaciones en niveles y grados de satisfacción
 * 
 * Implementa lógica adaptativa basada en minimum_threshold del proyecto
 * - minimum_threshold viene como porcentaje (ej: 80 = 80%)
 * - scores vienen en escala 0-10 (ej: 8.5)
 */
@Injectable()
export class ScoreClassificationService {
  private readonly logger = new Logger(ScoreClassificationService.name);

  /**
   * Calcula el nivel de puntuación basado en el score y minimum_threshold
   * 
   * Fórmula Excel original:
   * =SI($C6<2,75;"INACEPTABLE";SI($C6<5;"MINIMAMENTE ACEPTABLE";SI($C6<8,75;"RANGO OBJETIVO";"EXCEDE LOS REQUISITOS")))
   * 
   * Adaptación:
   * - Convierte minimum_threshold (80%) a escala 0-10 (8.0)
   * - Calcula rangos proporcionalmente
   * 
   * @param score - Puntuación en escala 0-10 (ej: 8.5)
   * @param minimumThreshold - Umbral mínimo en porcentaje (ej: 80)
   * @returns Nivel de puntuación
   */
  calculateScoreLevel(score: number, minimumThreshold: number): ScoreLevel {
    // Convertir minimum_threshold de porcentaje (0-100) a escala 0-10
    const thresholdValue = minimumThreshold / 10;

    this.logger.debug(
      `Calculating score level: score=${score}, threshold=${minimumThreshold}% (${thresholdValue} in 0-10 scale)`
    );

    // Rangos adaptativos basados en threshold
    // Para threshold=80 (8.0): < 2.75, < 5.0, < 8.75, >= 8.75
    const unacceptableLimit = thresholdValue * 0.34375;      // 2.75 para threshold=80
    const minimallyAcceptableLimit = thresholdValue * 0.625; // 5.0 para threshold=80
    const targetRangeLimit = thresholdValue * 1.09375;       // 8.75 para threshold=80

    this.logger.debug(
      `Adaptive limits: unacceptable<${unacceptableLimit.toFixed(2)}, ` +
      `minimallyAcceptable<${minimallyAcceptableLimit.toFixed(2)}, ` +
      `targetRange<${targetRangeLimit.toFixed(2)}`
    );

    if (score < unacceptableLimit) {
      this.logger.debug(`Result: ${ScoreLevel.UNACCEPTABLE}`);
      return ScoreLevel.UNACCEPTABLE;
    }

    if (score < minimallyAcceptableLimit) {
      this.logger.debug(`Result: ${ScoreLevel.MINIMALLY_ACCEPTABLE}`);
      return ScoreLevel.MINIMALLY_ACCEPTABLE;
    }

    if (score < targetRangeLimit) {
      this.logger.debug(`Result: ${ScoreLevel.TARGET_RANGE}`);
      return ScoreLevel.TARGET_RANGE;
    }

    this.logger.debug(`Result: ${ScoreLevel.EXCEEDS_REQUIREMENTS}`);
    return ScoreLevel.EXCEEDS_REQUIREMENTS;
  }

  /**
   * Calcula el grado de satisfacción basado en el score y minimum_threshold
   * 
   * Fórmula Excel original:
   * =SI($C6<5;"INSATISFACTORIO";SI($C6<8,75;"SATISFACTORIO";"MUY SATISFACTORIO"))
   * 
   * Adaptación:
   * - Convierte minimum_threshold (80%) a escala 0-10 (8.0)
   * - Calcula rangos proporcionalmente
   * 
   * @param score - Puntuación en escala 0-10 (ej: 8.5)
   * @param minimumThreshold - Umbral mínimo en porcentaje (ej: 80)
   * @returns Grado de satisfacción
   */
  calculateSatisfactionGrade(score: number, minimumThreshold: number): SatisfactionGrade {
    // Convertir minimum_threshold de porcentaje (0-100) a escala 0-10
    const thresholdValue = minimumThreshold / 10;

    this.logger.debug(
      `Calculating satisfaction grade: score=${score}, threshold=${minimumThreshold}% (${thresholdValue} in 0-10 scale)`
    );

    // Rangos adaptativos basados en threshold
    // Para threshold=80 (8.0): < 5.0, < 8.75, >= 8.75
    const unsatisfactoryLimit = thresholdValue * 0.625;   // 5.0 para threshold=80
    const satisfactoryLimit = thresholdValue * 1.09375;   // 8.75 para threshold=80

    this.logger.debug(
      `Adaptive limits: unsatisfactory<${unsatisfactoryLimit.toFixed(2)}, ` +
      `satisfactory<${satisfactoryLimit.toFixed(2)}`
    );

    if (score < unsatisfactoryLimit) {
      this.logger.debug(`Result: ${SatisfactionGrade.UNSATISFACTORY}`);
      return SatisfactionGrade.UNSATISFACTORY;
    }

    if (score < satisfactoryLimit) {
      this.logger.debug(`Result: ${SatisfactionGrade.SATISFACTORY}`);
      return SatisfactionGrade.SATISFACTORY;
    }

    this.logger.debug(`Result: ${SatisfactionGrade.VERY_SATISFACTORY}`);
    return SatisfactionGrade.VERY_SATISFACTORY;
  }

  /**
   * Calcula ambas clasificaciones de una vez
   * 
   * @param score - Puntuación en escala 0-10
   * @param minimumThreshold - Umbral mínimo en porcentaje
   * @returns Objeto con score_level y satisfaction_grade
   */
  classifyScore(score: number, minimumThreshold: number): {
    score_level: ScoreLevel;
    satisfaction_grade: SatisfactionGrade;
  } {
    return {
      score_level: this.calculateScoreLevel(score, minimumThreshold),
      satisfaction_grade: this.calculateSatisfactionGrade(score, minimumThreshold),
    };
  }
}
