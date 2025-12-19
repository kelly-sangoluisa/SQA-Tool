import { Injectable, Logger } from '@nestjs/common';

/**
 * Tipos de casos identificados según desired_threshold y worst_case
 */
export enum ThresholdCaseType {
  // Caso 1: desired=1/0, worst=null
  SIMPLE_BINARY = 'SIMPLE_BINARY',
  
  // Caso 2: desired=">=10/20min", worst="0/20min"
  RATIO_WITH_MIN_THRESHOLD = 'RATIO_WITH_MIN_THRESHOLD',
  
  // Caso 3: desired="0/1min", worst=">=10/1min"
  INVERSE_RATIO_WITH_MAX = 'INVERSE_RATIO_WITH_MAX',
  
  // Caso 4: desired="20min", worst=">20 min"
  TIME_THRESHOLD = 'TIME_THRESHOLD',
  
  // Caso 5: desired="0seg", worst=">=15 seg"
  ZERO_WITH_MAX_THRESHOLD = 'ZERO_WITH_MAX_THRESHOLD',
  
  // Caso 6: desired="0 %", worst=">=10%"
  PERCENTAGE_WITH_MAX = 'PERCENTAGE_WITH_MAX',
  
  // Caso 7: desired="1", worst=">=4"
  NUMERIC_WITH_MAX = 'NUMERIC_WITH_MAX',
  
  // Caso 8: desired="4", worst="0"
  NUMERIC_WITH_MIN = 'NUMERIC_WITH_MIN',
}

/**
 * Interfaz para threshold parseado
 */
export interface ParsedThreshold {
  operator?: string; // ">=", "<=", ">", "<", "="
  value: number;
  numerator?: number; // Para casos como "10/20min"
  denominator?: number;
  unit?: string; // "min", "seg", "%", null
}

/**
 * Resultado de clasificación de caso
 */
export interface ThresholdCase {
  caseType: ThresholdCaseType;
  desired: ParsedThreshold;
  worst: ParsedThreshold | null;
}

/**
 * Servicio especializado en parsear y clasificar thresholds
 * Responsabilidad única: Interpretar y clasificar desired_threshold y worst_case
 */
@Injectable()
export class ThresholdParserService {
  private readonly logger = new Logger(ThresholdParserService.name);

  /**
   * Clasifica el tipo de caso según desired_threshold y worst_case
   */
  classifyCase(desiredThreshold: string | null, worstCase: string | null): ThresholdCase {
    this.logger.debug(`Classifying case: desired="${desiredThreshold}", worst="${worstCase}"`);

    const desired = desiredThreshold ? this.parseThreshold(desiredThreshold) : null;
    const worst = worstCase ? this.parseThreshold(worstCase) : null;

    // Caso 1: desired es 1 o 0, worst es null
    if (desired && !worst && (desired.value === 1 || desired.value === 0) && !desired.unit) {
      return {
        caseType: ThresholdCaseType.SIMPLE_BINARY,
        desired,
        worst,
      };
    }

    // Caso 2: desired=">=10/20min", worst="0/20min"
    if (
      desired &&
      worst &&
      desired.operator === '>=' &&
      desired.numerator &&
      desired.denominator &&
      desired.unit &&
      worst.numerator === 0
    ) {
      return {
        caseType: ThresholdCaseType.RATIO_WITH_MIN_THRESHOLD,
        desired,
        worst,
      };
    }

    // Caso 3: desired="0/1min", worst=">=10/1min"
    if (
      desired &&
      worst &&
      desired.numerator === 0 &&
      desired.denominator &&
      worst.operator === '>=' &&
      worst.numerator
    ) {
      return {
        caseType: ThresholdCaseType.INVERSE_RATIO_WITH_MAX,
        desired,
        worst,
      };
    }

    // Caso 4: desired="20min", worst=">20 min"
    if (
      desired &&
      worst &&
      !desired.operator &&
      desired.unit === 'min' &&
      worst.operator &&
      worst.unit === 'min'
    ) {
      return {
        caseType: ThresholdCaseType.TIME_THRESHOLD,
        desired,
        worst,
      };
    }

    // Caso 5: desired="0seg", worst=">=15 seg"
    if (
      desired &&
      worst &&
      desired.value === 0 &&
      desired.unit === 'seg' &&
      worst.operator === '>=' &&
      worst.unit === 'seg'
    ) {
      return {
        caseType: ThresholdCaseType.ZERO_WITH_MAX_THRESHOLD,
        desired,
        worst,
      };
    }

    // Caso 6: desired="0 %", worst=">=10%"
    if (
      desired &&
      worst &&
      desired.value === 0 &&
      desired.unit === '%' &&
      worst.operator === '>=' &&
      worst.unit === '%'
    ) {
      return {
        caseType: ThresholdCaseType.PERCENTAGE_WITH_MAX,
        desired,
        worst,
      };
    }

    // Caso 7: desired="1", worst=">=4"
    if (
      desired &&
      worst &&
      !desired.operator &&
      !desired.unit &&
      worst.operator === '>=' &&
      !worst.unit
    ) {
      return {
        caseType: ThresholdCaseType.NUMERIC_WITH_MAX,
        desired,
        worst,
      };
    }

    // Caso 8: desired="4", worst="0"
    if (
      desired &&
      worst &&
      !desired.operator &&
      !desired.unit &&
      worst.value === 0 &&
      !worst.unit
    ) {
      return {
        caseType: ThresholdCaseType.NUMERIC_WITH_MIN,
        desired,
        worst,
      };
    }

    // Si no coincide con ningún caso, retornar binario simple por defecto
    this.logger.warn(`No specific case matched, using SIMPLE_BINARY as default`);
    return {
      caseType: ThresholdCaseType.SIMPLE_BINARY,
      desired: desired || { value: 1 },
      worst: null,
    };
  }

  /**
   * Parsea un threshold string a objeto estructurado
   */
  parseThreshold(threshold: string): ParsedThreshold {
    if (!threshold) {
      throw new Error('Threshold cannot be empty');
    }

    const trimmed = threshold.trim();

    // Extraer operador si existe
    const operatorMatch = /^(>=|<=|>|<|=)/.exec(trimmed);
    const operator = operatorMatch ? operatorMatch[1] : undefined;
    const valueStr = operator ? trimmed.substring(operator.length).trim() : trimmed;

    // Extraer unidad (min, seg, %)
    const unitMatch = /(min|seg|%)\s*$/.exec(valueStr);
    const unit = unitMatch ? unitMatch[1] : undefined;
    const numberStr = unit ? valueStr.replace(new RegExp(String.raw`\s*${unit}\s*$`), '').trim() : valueStr;

    // Eliminar espacios antes de parsear (para manejar "10 / 3" o "10 /3" o "10/ 3")
    const cleanNumberStr = numberStr.replaceAll(/\s+/g, '');

    // Verificar si es ratio (ej: "10/20")
    const ratioMatch = /^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/.exec(cleanNumberStr);
    if (ratioMatch) {
      return {
        operator,
        value: Number.parseFloat(ratioMatch[1]) / Number.parseFloat(ratioMatch[2]),
        numerator: Number.parseFloat(ratioMatch[1]),
        denominator: Number.parseFloat(ratioMatch[2]),
        unit,
      };
    }

    // Número simple
    const value = Number.parseFloat(cleanNumberStr);
    if (Number.isNaN(value)) {
      throw new TypeError(`Cannot parse threshold value: ${threshold}`);
    }

    return {
      operator,
      value,
      unit,
    };
  }
}