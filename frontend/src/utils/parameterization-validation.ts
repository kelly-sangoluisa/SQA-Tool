/**
 * Utilidades de validación específicas para formularios de parameterización
 * Proporciona validación en tiempo real y retroalimentación para el usuario
 */

import { validateThresholdFormat } from './data-entry/thresholdUtils';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
  success?: string;
}

/**
 * Valida el nombre de un estándar
 */
export function validateStandardName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: 'El nombre del estándar es requerido' };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'El nombre no puede exceder 100 caracteres' };
  }

  // Validar que no sea solo números
  if (/^\d+$/.test(trimmed)) {
    return { valid: false, error: 'El nombre no puede contener solo números' };
  }

  // Validar caracteres especiales excesivos
  if (/[<>{}[\]\\|`]/.test(trimmed)) {
    return { valid: false, error: 'El nombre contiene caracteres no permitidos' };
  }

  return { 
    valid: true, 
    success: '✓ Nombre válido' 
  };
}

/**
 * Valida la versión de un estándar
 */
export function validateStandardVersion(version: string): ValidationResult {
  const trimmed = version.trim();

  if (!trimmed) {
    return { valid: false, error: 'La versión es requerida' };
  }

  if (trimmed.length > 20) {
    return { valid: false, error: 'La versión no puede exceder 20 caracteres' };
  }

  // Formatos válidos: 1.0, 2023.1, v2.0, 1.0.0, etc.
  const versionPattern = /^[vV]?\d+(\.\d+)*$/;
  if (!versionPattern.test(trimmed)) {
    return { 
      valid: false, 
      error: 'Formato inválido. Use formato: 1.0, v2.0, 2023.1, etc.' 
    };
  }

  return { 
    valid: true, 
    success: '✓ Versión válida' 
  };
}

/**
 * Valida la descripción (aplica a todos los formularios)
 */
export function validateDescription(description: string, maxLength: number = 500): ValidationResult {
  const trimmed = description.trim();

  if (trimmed.length > maxLength) {
    return { 
      valid: false, 
      error: `La descripción no puede exceder ${maxLength} caracteres (actual: ${trimmed.length})` 
    };
  }

  if (trimmed.length === 0) {
    return { 
      valid: true, 
      warning: 'Se recomienda agregar una descripción para mayor claridad' 
    };
  }

  if (trimmed.length < 10) {
    return { 
      valid: true, 
      warning: 'Descripción muy corta. Considera agregar más detalles' 
    };
  }

  return { 
    valid: true, 
    success: trimmed.length >= 50 ? '✓ Descripción completa' : '✓ Descripción válida' 
  };
}

/**
 * Valida el nombre de un criterio
 */
export function validateCriterionName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: 'El nombre del criterio es requerido' };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'El nombre no puede exceder 100 caracteres' };
  }

  // Validar caracteres especiales excesivos
  if (/[<>{}[\]\\|`]/.test(trimmed)) {
    return { valid: false, error: 'El nombre contiene caracteres no permitidos' };
  }

  return { 
    valid: true, 
    success: '✓ Nombre válido' 
  };
}

/**
 * Valida el nombre de un subcriterio
 */
export function validateSubCriterionName(name: string): ValidationResult {
  return validateCriterionName(name); // Mismas reglas
}

/**
 * Valida el nombre de una métrica
 */
export function validateMetricName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: 'El nombre de la métrica es requerido' };
  }

  if (trimmed.length < 3) {
    return { valid: false, error: 'El nombre debe tener al menos 3 caracteres' };
  }

  if (trimmed.length > 150) {
    return { valid: false, error: 'El nombre no puede exceder 150 caracteres' };
  }

  return { 
    valid: true, 
    success: '✓ Nombre válido' 
  };
}

/**
 * Valida el código de una métrica
 */
export function validateMetricCode(code: string): ValidationResult {
  const trimmed = code.trim();

  if (!trimmed) {
    return { 
      valid: true, 
      warning: 'El código es opcional pero recomendado para organización' 
    };
  }

  if (trimmed.length > 20) {
    return { valid: false, error: 'El código no puede exceder 20 caracteres' };
  }

  // Formato recomendado: letras, números, guiones
  if (!/^[A-Za-z0-9-_.]+$/.test(trimmed)) {
    return { 
      valid: false, 
      error: 'El código solo puede contener letras, números, guiones y puntos' 
    };
  }

  // Formato recomendado detectado
  if (/^[A-Z]+-\d+$/.test(trimmed)) {
    return { 
      valid: true, 
      success: '✓ Código con formato estándar (ej: PO-1)' 
    };
  }

  return { 
    valid: true, 
    success: '✓ Código válido' 
  };
}

/**
 * Extrae las variables únicas de una fórmula matemática
 * Ejemplo: "1-(A/B)" -> ["A", "B"]
 * Ejemplo: "(A + B) * 100" -> ["A", "B"]
 */
export function extractVariablesFromFormula(formula: string): string[] {
  if (!formula) return [];

  // Encontrar todas las variables (letras mayúsculas, opcionalmente con guiones bajos y números)
  const matches = formula.match(/[A-Z][A-Z0-9_]*/g);
  
  if (!matches) return [];

  // Eliminar duplicados y ordenar
  return [...new Set(matches)].sort((a, b) => a.localeCompare(b));
}

/**
 * Valida una fórmula matemática (AHORA OBLIGATORIA)
 */
export function validateFormula(formula: string, isRequired: boolean = true): ValidationResult {
  const trimmed = formula.trim();

  if (!trimmed) {
    if (isRequired) {
      return { 
        valid: false, 
        error: 'La fórmula es obligatoria para las métricas' 
      };
    }
    return { 
      valid: true, 
      warning: 'La fórmula es opcional, pero ayuda en cálculos automáticos' 
    };
  }

  // Validar que contenga al menos una variable (letras mayúsculas)
  if (!/[A-Z]/.test(trimmed)) {
    return { 
      valid: false, 
      error: 'La fórmula debe contener al menos una variable (letras mayúsculas: A, B, C, etc.)' 
    };
  }

  // Validar paréntesis balanceados
  const openParens = (trimmed.match(/\(/g) || []).length;
  const closeParens = (trimmed.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    return { 
      valid: false, 
      error: 'Paréntesis desbalanceados en la fórmula' 
    };
  }

  // Validar caracteres permitidos
  if (!/^[A-Z0-9+\-*/()._\s]+$/.test(trimmed)) {
    return { 
      valid: false, 
      error: 'La fórmula contiene caracteres no permitidos. Use: A-Z, 0-9, +, -, *, /, (, ), _' 
    };
  }

  // Detectar patrones comunes
  const variables = extractVariablesFromFormula(trimmed);
  const varCount = variables.length;

  // Priorizar detección de porcentaje (más específico)
  if (trimmed.includes('*') && trimmed.includes('100')) {
    return { 
      valid: true, 
      success: `✓ Fórmula de porcentaje detectada (${varCount} variable${varCount === 1 ? '' : 's'}: ${variables.join(', ')})` 
    };
  }

  if (trimmed.includes('/')) {
    return { 
      valid: true, 
      success: `✓ Fórmula con división detectada (${varCount} variable${varCount === 1 ? '' : 's'}: ${variables.join(', ')})` 
    };
  }

  return { 
    valid: true, 
    success: `✓ Fórmula válida (${varCount} variable${varCount === 1 ? '' : 's'}: ${variables.join(', ')})` 
  };
}

/**
 * Valida que las variables definidas coincidan exactamente con las de la fórmula
 */
export function validateVariablesMatchFormula(
  formula: string,
  definedVariables: Array<{ symbol: string; description: string }>
): ValidationResult {
  const trimmed = formula.trim();

  // Si no hay fórmula, no hay nada que validar
  if (!trimmed) {
    if (definedVariables.length > 0) {
      return {
        valid: false,
        error: 'No se pueden definir variables sin una fórmula'
      };
    }
    return { valid: true };
  }

  const requiredVars = extractVariablesFromFormula(trimmed);
  const definedSymbols = definedVariables
    .map(v => v.symbol.trim())
    .filter(s => s.length > 0)
    .sort((a, b) => a.localeCompare(b));

  // Validar que todas las variables de la fórmula estén definidas
  const missingVars = requiredVars.filter(v => !definedSymbols.includes(v));
  if (missingVars.length > 0) {
    return {
      valid: false,
      error: `Faltan definir las variables: ${missingVars.join(', ')}`
    };
  }

  // Validar que no haya variables extras que no estén en la fórmula
  const extraVars = definedSymbols.filter(s => !requiredVars.includes(s));
  if (extraVars.length > 0) {
    return {
      valid: false,
      error: `Variables no usadas en la fórmula: ${extraVars.join(', ')}. Elimínelas o úselas en la fórmula.`
    };
  }

  // Validar que haya la misma cantidad
  if (requiredVars.length !== definedSymbols.length) {
    return {
      valid: false,
      error: `La fórmula requiere ${requiredVars.length} variable${requiredVars.length === 1 ? '' : 's'}, pero hay ${definedSymbols.length} definida${definedSymbols.length === 1 ? '' : 's'}`
    };
  }

  return {
    valid: true,
    success: `✓ Todas las variables (${requiredVars.length}) están correctamente definidas`
  };
}

/**
 * Valida el símbolo de una variable
 */
export function validateVariableSymbol(symbol: string): ValidationResult {
  const trimmed = symbol.trim();

  if (!trimmed) {
    return { valid: false, error: 'El símbolo de la variable es requerido' };
  }

  // Debe ser letras mayúsculas y opcionalmente guiones bajos
  if (!/^[A-Z][A-Z0-9_]*$/.test(trimmed)) {
    return { 
      valid: false, 
      error: 'El símbolo debe comenzar con mayúscula y usar solo letras, números y guiones bajos (ej: VAR_A)' 
    };
  }

  if (trimmed.length > 30) {
    return { valid: false, error: 'El símbolo no puede exceder 30 caracteres' };
  }

  return { 
    valid: true, 
    success: '✓ Símbolo válido' 
  };
}

/**
 * Valida la descripción de una variable
 */
export function validateVariableDescription(description: string): ValidationResult {
  const trimmed = description.trim();

  if (!trimmed) {
    return { valid: false, error: 'La descripción de la variable es requerida' };
  }

  if (trimmed.length < 3) {
    return { valid: false, error: 'La descripción debe tener al menos 3 caracteres' };
  }

  if (trimmed.length > 200) {
    return { valid: false, error: 'La descripción no puede exceder 200 caracteres' };
  }

  return { 
    valid: true, 
    success: '✓ Descripción válida' 
  };
}

/**
 * Valida un umbral (threshold) usando la función existente y agrega mensajes de éxito
 */
export function validateThreshold(threshold: string, fieldName: string = 'umbral'): ValidationResult {
  const trimmed = threshold.trim();

  if (!trimmed) {
    return { 
      valid: true, 
      warning: `El ${fieldName} es opcional pero recomendado para evaluaciones` 
    };
  }

  const result = validateThresholdFormat(trimmed);
  
  if (!result.valid) {
    return result;
  }

  // Agregar mensajes de éxito según el formato detectado
  if (/^(>=|<=|>|<)/.test(trimmed)) {
    if (/\d{1,10}\/\d{1,10}/.test(trimmed)) {
      return { valid: true, success: '✓ Umbral con ratio y operador válido' };
    }
    return { valid: true, success: '✓ Umbral con operador válido' };
  }

  if (/\d{1,10}\/\d{1,10}/.test(trimmed)) {
    return { valid: true, success: '✓ Umbral con ratio válido' };
  }

  if (/(min|seg|%|ms|s|h)/.test(trimmed)) {
    return { valid: true, success: '✓ Umbral con unidad válido' };
  }

  return { valid: true, success: '✓ Umbral válido' };
}

/**
 * Función helper para obtener el color del mensaje según el tipo
 */
export function getValidationMessageType(result: ValidationResult): 'error' | 'warning' | 'success' | null {
  if (result.error) return 'error';
  if (result.warning) return 'warning';
  if (result.success) return 'success';
  return null;
}

/**
 * Función helper para obtener el mensaje a mostrar
 */
export function getValidationMessage(result: ValidationResult): string | null {
  return result.error || result.warning || result.success || null;
}
