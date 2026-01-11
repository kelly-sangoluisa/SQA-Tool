/**
 * Utilidades para detectar variables fijas basadas en thresholds
 */

interface ParsedThreshold {
  operator?: string; // ">=", "<=", ">", "<", "="
  value: number;
  numerator?: number;
  denominator?: number;
  unit?: string; // "min", "seg", "%", etc.
}

export interface FixedVariableInfo {
  symbol: string;
  fixedValue: number;
  reason: string; // Para debugging
}

/**
 * Parsea un threshold string a objeto estructurado
 */
function parseThreshold(threshold: string): ParsedThreshold | null {
  if (!threshold) return null;

  const trimmed = threshold.trim();

  // Extraer operador si existe
  const operatorMatch = /^(>=|<=|>|<|=)/.exec(trimmed);
  const operator = operatorMatch ? operatorMatch[1] : undefined;
  const valueStr = operator ? trimmed.substring(operator.length).trim() : trimmed;

  // Extraer unidad (min, seg, %, etc.)
  const unitMatch = /(min|seg|%|ms|s|h)\s*$/.exec(valueStr);
  const unit = unitMatch ? unitMatch[1] : undefined;
  const numberStr = unit ? valueStr.replace(new RegExp(String.raw`\s*${unit}\s*$`), '').trim() : valueStr;

  // Eliminar espacios antes de parsear
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
  if (Number.isNaN(value)) return null;

  return {
    operator,
    value,
    unit,
  };
}

/**
 * Detecta qué variables deben ser fijas basándose en la fórmula y los thresholds
 * 
 * Casos donde hay variables fijas:
 * 1. Fórmula con división (A/B) + threshold con ratio (ej: ">=10/20min")
 *    → La variable del denominador (B) es fija con el valor del denominador del threshold (20)
 * 
 * 2. Fórmula con división (A/B) + desired con ratio "0/X" + worst con ratio ">=Y/X"
 *    → La variable del denominador (B) es fija con el valor X
 */
export function detectFixedVariables(
  formula: string,
  desiredThreshold: string | null,
  worstCase: string | null
): FixedVariableInfo[] {
  const fixedVariables: FixedVariableInfo[] = [];

  if (!formula) return fixedVariables;

  const desired = desiredThreshold ? parseThreshold(desiredThreshold) : null;
  const worst = worstCase ? parseThreshold(worstCase) : null;

  // Solo procesamos si hay unidad "min" o si hay ratios
  const hasMinUnit = desired?.unit === 'min' || worst?.unit === 'min';
  const hasRatio = desired?.denominator || worst?.denominator;

  if (!hasMinUnit && !hasRatio) {
    return fixedVariables; // No hay variables fijas
  }

  // Detectar patrón de división en la fórmula (ej: "A/B", "1-(A/B)", "(A/B)*100")
  const divisionPattern = /([A-Z])\s*\/\s*([A-Z])/;
  const match = divisionPattern.exec(formula);

  if (!match) {
    return fixedVariables; // No hay división en la fórmula
  }

  const [, , denominatorVar] = match;

  // Caso 1: desired o worst tiene denominador (ratio como ">=10/20min")
  if (desired?.denominator && hasMinUnit) {
    fixedVariables.push({
      symbol: denominatorVar,
      fixedValue: desired.denominator,
      reason: `Denominador fijo del threshold deseado (${desiredThreshold})`
    });
    return fixedVariables;
  }

  if (worst?.denominator && hasMinUnit) {
    fixedVariables.push({
      symbol: denominatorVar,
      fixedValue: worst.denominator,
      reason: `Denominador fijo del worst case (${worstCase})`
    });
    return fixedVariables;
  }

  // Caso 2: desired="0/X" + worst=">=Y/X" (mismo denominador)
  if (
    desired?.numerator === 0 &&
    desired?.denominator &&
    worst?.denominator &&
    desired.denominator === worst.denominator
  ) {
    fixedVariables.push({
      symbol: denominatorVar,
      fixedValue: desired.denominator,
      reason: `Denominador común en thresholds (${desired.denominator})`
    });
    return fixedVariables;
  }

  return fixedVariables;
}

/**
 * Verifica si una variable específica debe ser fija
 */
export function isVariableFixed(
  variableSymbol: string,
  formula: string,
  desiredThreshold: string | null,
  worstCase: string | null
): { isFixed: boolean; fixedValue?: number; reason?: string } {
  const fixedVars = detectFixedVariables(formula, desiredThreshold, worstCase);
  const found = fixedVars.find(v => v.symbol === variableSymbol);

  if (found) {
    return {
      isFixed: true,
      fixedValue: found.fixedValue,
      reason: found.reason
    };
  }

  return { isFixed: false };
}

/**
 * Obtiene el valor fijo de una variable (si aplica)
 */
export function getFixedValue(
  variableSymbol: string,
  formula: string,
  desiredThreshold: string | null,
  worstCase: string | null
): number | null {
  const result = isVariableFixed(variableSymbol, formula, desiredThreshold, worstCase);
  return result.isFixed && result.fixedValue !== undefined ? result.fixedValue : null;
}
