import { Injectable, Logger } from '@nestjs/common';

// Services
import { ThresholdParserService, ThresholdCaseType, ThresholdCase } from './threshold-parser.service';
import { FormulaEvaluationService } from './formula-evaluation.service';

/**
 * Resultado del cálculo de scoring
 */
export interface MetricScore {
  calculated_value: number;
  weighted_value: number;
}

/**
 * Servicio especializado en calcular scores de métricas
 * Responsabilidad única: Calcular calculated_value y weighted_value según casos de negocio
 */
@Injectable()
export class MetricScoringService {
  private readonly logger = new Logger(MetricScoringService.name);
  private readonly MAX_SCORE = 10; // Ponderación sobre 10

  constructor(
    private readonly thresholdParser: ThresholdParserService,
    private readonly formulaEvaluation: FormulaEvaluationService,
  ) {}

  /**
   * Calcula el score de una métrica según su caso específico
   */
  calculateScore(
    formula: string,
    variables: { symbol: string; value: number }[],
    desiredThreshold: string | null,
    worstCase: string | null,
  ): MetricScore {
    this.logger.debug(`Calculating score for formula: ${formula}`);
    this.logger.debug(`Desired: ${desiredThreshold}, Worst: ${worstCase}`);

    const thresholdCase = this.thresholdParser.classifyCase(desiredThreshold, worstCase);
    this.logger.debug(`Case type: ${thresholdCase.caseType}`);

    switch (thresholdCase.caseType) {
      case ThresholdCaseType.SIMPLE_BINARY:
        return this.calculateSimpleBinary(formula, variables);

      case ThresholdCaseType.RATIO_WITH_MIN_THRESHOLD:
        return this.calculateRatioWithMinThreshold(formula, variables, thresholdCase);

      case ThresholdCaseType.INVERSE_RATIO_WITH_MAX:
        return this.calculateInverseRatioWithMax(formula, variables, thresholdCase);

      case ThresholdCaseType.TIME_THRESHOLD:
        return this.calculateTimeThreshold(formula, variables, thresholdCase);

      case ThresholdCaseType.ZERO_WITH_MAX_THRESHOLD:
        return this.calculateZeroWithMaxThreshold(formula, variables, thresholdCase);

      case ThresholdCaseType.PERCENTAGE_WITH_MAX:
        return this.calculatePercentageWithMax(formula, variables, thresholdCase);

      case ThresholdCaseType.NUMERIC_WITH_MAX:
        return this.calculateNumericWithMax(formula, variables, thresholdCase);

      case ThresholdCaseType.NUMERIC_WITH_MIN:
        return this.calculateNumericWithMin(formula, variables, thresholdCase);

      default:
        this.logger.warn(`Unknown case type, using simple binary`);
        return this.calculateSimpleBinary(formula, variables);
    }
  }

  // =========================================================================
  // CASO 1: SIMPLE_BINARY
  // desired=1/0, worst=null
  // calculated_value = evaluar fórmula
  // weighted_value = calculated_value * 10
  // =========================================================================
  private calculateSimpleBinary(
    formula: string,
    variables: { symbol: string; value: number }[],
  ): MetricScore {
    const calculated_value = this.formulaEvaluation.evaluateFormula(formula, variables);
    const weighted_value = calculated_value * this.MAX_SCORE;

    this.logger.debug(`[SIMPLE_BINARY] calculated=${calculated_value}, weighted=${weighted_value}`);
    return { calculated_value, weighted_value };
  }

  // =========================================================================
  // CASO 2: RATIO_WITH_MIN_THRESHOLD
  // desired=">=10/20min", worst="0/20min"
  // calculated_value = valor de variable A (informativo)
  // weighted_value = Si A >= D entonces 10, sino (A/D)*10
  // =========================================================================
  private calculateRatioWithMinThreshold(
    formula: string,
    variables: { symbol: string; value: number }[],
    thresholdCase: ThresholdCase,
  ): MetricScore {
    // El denominador T viene fijo en la fórmula, solo necesitamos A
    const A = this.getSingleVariableValue(variables);
    const D = thresholdCase.desired.numerator!; // El numerador del desired (ej: 10)

    const calculated_value = A; // Informativo
    const weighted_value = A >= D ? this.MAX_SCORE : (A / D) * this.MAX_SCORE;

    this.logger.debug(
      `[RATIO_WITH_MIN_THRESHOLD] A=${A}, D=${D}, calculated=${calculated_value}, weighted=${weighted_value}`,
    );
    return { calculated_value, weighted_value };
  }

  // =========================================================================
  // CASO 3: INVERSE_RATIO_WITH_MAX
  // desired="0/1min", worst=">=10/1min"
  // calculated_value = A (informativo)
  // weighted_value = Si A > W entonces 0, sino (1-(A/W))*10
  // =========================================================================
  private calculateInverseRatioWithMax(
    formula: string,
    variables: { symbol: string; value: number }[],
    thresholdCase: ThresholdCase,
  ): MetricScore {
    const A = this.getSingleVariableValue(variables);
    const W = thresholdCase.worst!.numerator!; // El numerador del worst case (ej: 10)

    const calculated_value = A; // Informativo
    const weighted_value = A > W ? 0 : (1 - A / W) * this.MAX_SCORE;

    this.logger.debug(
      `[INVERSE_RATIO_WITH_MAX] A=${A}, W=${W}, calculated=${calculated_value}, weighted=${weighted_value}`,
    );
    return { calculated_value, weighted_value };
  }

  // =========================================================================
  // CASO 4: TIME_THRESHOLD
  // desired="20min", worst=">20 min"
  // calculated_value = evaluar fórmula (ej: B-A)
  // weighted_value = Si calculated > W entonces 0, sino (calculated/D)*10
  // =========================================================================
  private calculateTimeThreshold(
    formula: string,
    variables: { symbol: string; value: number }[],
    thresholdCase: ThresholdCase,
  ): MetricScore {
    const calculated_value = this.formulaEvaluation.evaluateFormula(formula, variables);
    const D = thresholdCase.desired.value; // desired threshold (ej: 20)
    const W = thresholdCase.worst!.value; // worst case (ej: 20)

    const weighted_value = calculated_value > W ? 0 : (calculated_value / D) * this.MAX_SCORE;

    this.logger.debug(
      `[TIME_THRESHOLD] calculated=${calculated_value}, D=${D}, W=${W}, weighted=${weighted_value}`,
    );
    return { calculated_value, weighted_value };
  }

  // =========================================================================
  // CASO 5: ZERO_WITH_MAX_THRESHOLD
  // desired="0seg", worst=">=15 seg"
  // calculated_value = evaluar fórmula
  // weighted_value = Si calculated > W entonces 0, sino (1-(calculated/W))*10
  // =========================================================================
  private calculateZeroWithMaxThreshold(
    formula: string,
    variables: { symbol: string; value: number }[],
    thresholdCase: ThresholdCase,
  ): MetricScore {
    const calculated_value = this.formulaEvaluation.evaluateFormula(formula, variables);
    const W = thresholdCase.worst!.value; // worst case (ej: 15)

    const weighted_value = calculated_value > W ? 0 : (1 - calculated_value / W) * this.MAX_SCORE;

    this.logger.debug(
      `[ZERO_WITH_MAX_THRESHOLD] calculated=${calculated_value}, W=${W}, weighted=${weighted_value}`,
    );
    return { calculated_value, weighted_value };
  }

  // =========================================================================
  // CASO 6: PERCENTAGE_WITH_MAX
  // desired="0 %", worst=">=10%"
  // calculated_value = valor de A (o evaluar fórmula si es más compleja)
  // weighted_value = Si calculated >= W entonces 0, Si calculated == 1 entonces 10,
  //                  sino (1-(calculated/W))*10
  // =========================================================================
  private calculatePercentageWithMax(
    formula: string,
    variables: { symbol: string; value: number }[],
    thresholdCase: ThresholdCase,
  ): MetricScore {
    // Intentar obtener valor único, si falla evaluar fórmula
    const calculated_value = this.tryGetSingleVariableOrEvaluate(formula, variables);
    const W = thresholdCase.worst!.value; // worst case (ej: 10)

    let weighted_value: number;
    if (calculated_value >= W) {
      weighted_value = 0;
    } else if (calculated_value === 1) {
      weighted_value = this.MAX_SCORE;
    } else {
      weighted_value = (1 - calculated_value / W) * this.MAX_SCORE;
    }

    this.logger.debug(
      `[PERCENTAGE_WITH_MAX] calculated=${calculated_value}, W=${W}, weighted=${weighted_value}`,
    );
    return { calculated_value, weighted_value };
  }

  // =========================================================================
  // CASO 7: NUMERIC_WITH_MAX
  // desired="1", worst=">=4"
  // calculated_value = evaluar fórmula (usualmente solo A)
  // weighted_value = Si calculated >= W entonces 0, Si calculated == D entonces 10,
  //                  sino (1-(calculated/W))*10
  // =========================================================================
  private calculateNumericWithMax(
    formula: string,
    variables: { symbol: string; value: number }[],
    thresholdCase: ThresholdCase,
  ): MetricScore {
    const calculated_value = this.tryGetSingleVariableOrEvaluate(formula, variables);
    const D = thresholdCase.desired.value; // desired (ej: 1)
    const W = thresholdCase.worst!.value; // worst case (ej: 4)

    let weighted_value: number;
    if (calculated_value >= W) {
      weighted_value = 0;
    } else if (calculated_value === D) {
      weighted_value = this.MAX_SCORE;
    } else {
      weighted_value = (1 - calculated_value / W) * this.MAX_SCORE;
    }

    this.logger.debug(
      `[NUMERIC_WITH_MAX] calculated=${calculated_value}, D=${D}, W=${W}, weighted=${weighted_value}`,
    );
    return { calculated_value, weighted_value };
  }

  // =========================================================================
  // CASO 8: NUMERIC_WITH_MIN
  // desired="4", worst="0"
  // calculated_value = evaluar fórmula (usualmente solo A)
  // weighted_value = Si calculated == W entonces 0, Si calculated == D entonces 10,
  //                  sino (calculated/D)*10
  // =========================================================================
  private calculateNumericWithMin(
    formula: string,
    variables: { symbol: string; value: number }[],
    thresholdCase: ThresholdCase,
  ): MetricScore {
    const calculated_value = this.tryGetSingleVariableOrEvaluate(formula, variables);
    const D = thresholdCase.desired.value; // desired (ej: 4)
    const W = thresholdCase.worst!.value; // worst case (ej: 0)

    let weighted_value: number;
    if (calculated_value === W) {
      weighted_value = 0;
    } else if (calculated_value >= D) {
      weighted_value = this.MAX_SCORE;
    } else {
      weighted_value = (calculated_value / D) * this.MAX_SCORE;
    }

    this.logger.debug(
      `[NUMERIC_WITH_MIN] calculated=${calculated_value}, D=${D}, W=${W}, weighted=${weighted_value}`,
    );
    return { calculated_value, weighted_value };
  }

  // =========================================================================
  // MÉTODOS AUXILIARES
  // =========================================================================

  /**
   * Obtiene el valor de una única variable (para casos donde solo se pide A)
   */
  private getSingleVariableValue(variables: { symbol: string; value: number }[]): number {
    if (variables.length === 0) {
      throw new Error('No variables provided');
    }
    // Retornar el primer valor (usualmente será A)
    return variables[0].value;
  }

  /**
   * Intenta obtener valor único, si hay más evalúa la fórmula
   */
  private tryGetSingleVariableOrEvaluate(
    formula: string,
    variables: { symbol: string; value: number }[],
  ): number {
    // Si la fórmula es solo una letra (ej: "A"), retornar ese valor
    if (/^[A-Z]$/i.test(formula.trim()) && variables.length === 1) {
      return variables[0].value;
    }
    // Si no, evaluar la fórmula completa
    return this.formulaEvaluation.evaluateFormula(formula, variables);
  }
}