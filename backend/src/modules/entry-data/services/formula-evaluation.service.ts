import { Injectable, Logger } from '@nestjs/common';

/**
 * Servicio especializado en evaluación de fórmulas matemáticas
 * Responsabilidad única: Cálculos y evaluación de expresiones
 */
@Injectable()
export class FormulaEvaluationService {
  private readonly logger = new Logger(FormulaEvaluationService.name);

  /**
   * Evalúa una fórmula matemática con valores de variables
   * @param formula - Expresión matemática (ej: "a/b")
   * @param variables - Array de variables con sus valores
   * @returns Resultado numérico de la evaluación
   */
  evaluateFormula(formula: string, variables: {symbol: string, value: number}[]): number {
    this.logger.debug(`Evaluating formula: ${formula}`, { variables });

    try {
      const expression = this.prepareExpression(formula, variables);
      return this.executeCalculation(expression);
    } catch (error) {
      this.logger.error('Formula evaluation failed', { formula, variables, error: error.message });
      throw new Error(`Formula evaluation failed: ${error.message}`);
    }
  }

  /**
   * Prepara la expresión sustituyendo variables por valores
   */
  private prepareExpression(formula: string, variables: {symbol: string, value: number}[]): string {
    if (!formula?.trim()) {
      throw new Error('Formula cannot be empty');
    }

    let expression = formula.trim();

    // Primero validar si la fórmula contiene caracteres inválidos
    this.validateForInvalidCharacters(formula);

    // Reemplazar variables manteniendo orden de precedencia
    const sortedVariables = variables.sort((a, b) => b.symbol.length - a.symbol.length);
    
    for (const variable of sortedVariables) {
      const regex = new RegExp(`\\b${this.escapeRegExp(variable.symbol)}\\b`, 'g');
      expression = expression.replace(regex, variable.value.toString());
    }

    this.validateExpression(expression);
    return expression;
  }

  /**
   * Valida que la fórmula original no contenga caracteres peligrosos o inválidos
   */
  private validateForInvalidCharacters(formula: string): void {
    // Lista de caracteres/tokens no permitidos en fórmulas matemáticas
    const dangerousPatterns = [
      /[;]/,                    // Punto y coma (SQL injection)
      /\bDROP\b/i,             // Palabras SQL peligrosas
      /\bTABLE\b/i,
      /\bDELETE\b/i,
      /\bINSERT\b/i,
      /\bUPDATE\b/i,
      /\bSELECT\b/i,
      /['"]/,                  // Comillas (potential string injection)
      /[{}]/,                  // Llaves
      /\$[{]/,                 // Template literals
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(formula)) {
        throw new Error('Expression contains invalid characters');
      }
    }
  }

  /**
   * Valida que la expresión no contenga variables sin reemplazar
   */
  private validateExpression(expression: string): void {
    if (/[a-zA-Z]/.test(expression)) {
      throw new Error(`Expression contains unreplaced variables: ${expression}`);
    }

    // Validar caracteres permitidos (números, operadores, paréntesis, puntos)
    if (!/^[\d+\-*/().\s]+$/.test(expression)) {
      throw new Error(`Expression contains invalid characters: ${expression}`);
    }
  }

  /**
   * Ejecuta el cálculo matemático de forma segura usando parser manual
   * Sin usar eval() o Function constructor para evitar riesgos de seguridad
   */
  private executeCalculation(expression: string): number {
    try {
      // Limpiar espacios y validar expresión final
      const cleanExpression = expression.replace(/\s/g, '');
      
      if (!cleanExpression) {
        throw new Error('Empty expression');
      }

      // Usar parser manual seguro
      const result = this.evaluateExpression(cleanExpression);
      
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error(`Invalid calculation result: ${result}`);
      }

      return Number(result.toFixed(4)); // Redondear a 4 decimales
    } catch (error) {
      throw new Error(`Calculation error: ${error.message}`);
    }
  }

  /**
   * Parser seguro de expresiones matemáticas
   * Soporta +, -, *, /, paréntesis y números decimales
   */
  private evaluateExpression(expression: string): number {
    // Eliminar espacios
    expression = expression.replace(/\s/g, '');
    
    // Validar que solo contenga caracteres matemáticos válidos
    if (!/^[\d+\-*/().]+$/.test(expression)) {
      throw new Error('Invalid characters in expression');
    }

    return this.parseExpression(expression, 0).value;
  }

  /**
   * Parser recursivo para expresiones matemáticas
   * Maneja precedencia de operadores correctamente
   */
  private parseExpression(expression: string, index: number): { value: number; nextIndex: number } {
    let result = this.parseTerm(expression, index);
    
    while (result.nextIndex < expression.length) {
      const operator = expression[result.nextIndex];
      
      if (operator === '+' || operator === '-') {
        const nextTerm = this.parseTerm(expression, result.nextIndex + 1);
        
        if (operator === '+') {
          result.value += nextTerm.value;
        } else {
          result.value -= nextTerm.value;
        }
        
        result.nextIndex = nextTerm.nextIndex;
      } else {
        break;
      }
    }
    
    return result;
  }

  /**
   * Parser para términos (multiplicación y división)
   */
  private parseTerm(expression: string, index: number): { value: number; nextIndex: number } {
    let result = this.parseFactor(expression, index);
    
    while (result.nextIndex < expression.length) {
      const operator = expression[result.nextIndex];
      
      if (operator === '*' || operator === '/') {
        const nextFactor = this.parseFactor(expression, result.nextIndex + 1);
        
        if (operator === '*') {
          result.value *= nextFactor.value;
        } else {
          if (nextFactor.value === 0) {
            throw new Error('Division by zero');
          }
          result.value /= nextFactor.value;
        }
        
        result.nextIndex = nextFactor.nextIndex;
      } else {
        break;
      }
    }
    
    return result;
  }

  /**
   * Parser para factores (números y paréntesis)
   */
  private parseFactor(expression: string, index: number): { value: number; nextIndex: number } {
    if (index >= expression.length) {
      throw new Error('Unexpected end of expression');
    }
    
    // Manejar números negativos
    if (expression[index] === '-') {
      const result = this.parseFactor(expression, index + 1);
      return { value: -result.value, nextIndex: result.nextIndex };
    }
    
    // Manejar números positivos explícitos
    if (expression[index] === '+') {
      return this.parseFactor(expression, index + 1);
    }
    
    // Manejar paréntesis
    if (expression[index] === '(') {
      const result = this.parseExpression(expression, index + 1);
      
      if (result.nextIndex >= expression.length || expression[result.nextIndex] !== ')') {
        throw new Error('Missing closing parenthesis');
      }
      
      return { value: result.value, nextIndex: result.nextIndex + 1 };
    }
    
    // Manejar números
    return this.parseNumber(expression, index);
  }

  /**
   * Parser para números (enteros y decimales)
   */
  private parseNumber(expression: string, index: number): { value: number; nextIndex: number } {
    let numberStr = '';
    let currentIndex = index;
    
    // Leer dígitos y punto decimal
    while (currentIndex < expression.length && /[\d.]/.test(expression[currentIndex])) {
      numberStr += expression[currentIndex];
      currentIndex++;
    }
    
    if (numberStr === '') {
      throw new Error(`Expected number at position ${index}`);
    }
    
    const value = parseFloat(numberStr);
    
    if (isNaN(value)) {
      throw new Error(`Invalid number: ${numberStr}`);
    }
    
    return { value, nextIndex: currentIndex };
  }

  /**
   * Escapa caracteres especiales para regex
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Valida que las variables requeridas estén presentes
   */
  validateRequiredVariables(formula: string, providedVariables: {symbol: string}[]): string[] {
    const variablePattern = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
    const requiredVariables = formula.match(variablePattern) || [];
    const providedSymbols = providedVariables.map(v => v.symbol);
    
    return requiredVariables.filter(variable => !providedSymbols.includes(variable));
  }
}