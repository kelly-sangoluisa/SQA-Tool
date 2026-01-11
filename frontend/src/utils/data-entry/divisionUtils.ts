/**
 * Utilidades para detectar y validar divisiones en fórmulas matemáticas
 */

/**
 * Detecta si una variable es denominador en una fórmula (aparece después de '/')
 * 
 * Identifica patrones como:
 * - "a/b" → b es denominador
 * - "(x+y)/b" → b es denominador  
 * - "100*a/b" → b es denominador
 * - "a/(b+c)" → b y c son denominadores
 * 
 * @param variableSymbol - El símbolo de la variable a verificar (ej: "a", "b")
 * @param formula - La fórmula matemática completa
 * @returns true si la variable es denominador, false en caso contrario
 * 
 * @example
 * isDenominatorVariable("b", "a/b") // true
 * isDenominatorVariable("a", "a/b") // false
 * isDenominatorVariable("b", "1-(a/b)*100") // true
 */
export function isDenominatorVariable(variableSymbol: string, formula: string): boolean {
  if (!formula || !variableSymbol) return false;
  
  // Buscar patrones de división donde la variable está en el denominador
  // Escapa el símbolo para usar en regex
  const escapedSymbol = variableSymbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  const patterns = [
    // División directa: algo/variable (seguido de operador, paréntesis o fin)
    new RegExp(String.raw`/\s*${escapedSymbol}\b(?:\s*[+\-*/)$]|$)`, 'i'),
    
    // División con paréntesis antes: )/variable
    new RegExp(String.raw`\)\s*/\s*${escapedSymbol}\b`, 'i'),
    
    // Variable dentro de paréntesis de denominador: /(variable o /( algo variable
    new RegExp(String.raw`/\s*\([^)]*\b${escapedSymbol}\b[^)]*\)`, 'i'),
  ];
  
  return patterns.some(pattern => pattern.test(formula));
}

/**
 * Valida que un valor no cause división por cero
 * 
 * @param value - El valor a validar
 * @param variableSymbol - El símbolo de la variable
 * @param formula - La fórmula matemática
 * @returns Objeto con resultado de validación y mensaje de error opcional
 * 
 * @example
 * validateNoDivisionByZero(0, "b", "a/b")
 * // { isValid: false, errorMessage: "No se puede usar 0 en esta variable..." }
 */
export function validateNoDivisionByZero(
  value: number | string,
  variableSymbol: string,
  formula: string
): { isValid: boolean; errorMessage?: string } {
  const numValue = typeof value === 'string' ? Number.parseFloat(value) : value;
  
  // Si el valor no es 0, es válido
  if (numValue !== 0) {
    return { isValid: true };
  }
  
  // Si el valor es 0, verificar si es denominador
  if (isDenominatorVariable(variableSymbol, formula)) {
    return {
      isValid: false,
      errorMessage: 'No se puede usar 0 en el denominador de una división.'
    };
  }
  
  return { isValid: true };
}

/**
 * Extrae todas las variables denominadoras de una fórmula
 * 
 * @param formula - La fórmula matemática
 * @param variables - Lista de símbolos de variables disponibles
 * @returns Array con los símbolos de variables que son denominadores
 * 
 * @example
 * getDenominatorVariables("a/b + c/d", ["a", "b", "c", "d"])
 * // ["b", "d"]
 */
export function getDenominatorVariables(
  formula: string,
  variables: string[]
): string[] {
  return variables.filter(symbol => isDenominatorVariable(symbol, formula));
}
