/**
 * Utilidades para trabajar con fórmulas matemáticas
 */

interface Variable {
  symbol: string;
  [key: string]: unknown;
}

/**
 * Ordena las variables según el orden en que aparecen en la fórmula
 * @param formula - La fórmula matemática (ej: "a+b/d" o "d/b+a")
 * @param variables - Array de variables a ordenar
 * @returns Array de variables ordenadas según su aparición en la fórmula
 */

export function sortVariablesByFormulaOrder<T extends Variable>(
  formula: string,
  variables: T[]
): T[] {
  if (!formula || !variables || variables.length === 0) {
    return variables;
  }

  // Crear un mapa de símbolo -> posición en la fórmula
  const symbolPositions = new Map<string, number>();

  variables.forEach(variable => {
    const symbol = variable.symbol;
    // Buscar la primera aparición del símbolo en la fórmula (case insensitive)
    const regex = new RegExp(symbol, 'i');
    const match = regex.exec(formula);
    
    if (match?.index === undefined) {
      // Si no se encuentra en la fórmula, ponerlo al final
      symbolPositions.set(symbol, Infinity);
    } else {
      symbolPositions.set(symbol, match.index);
    }
  });

  // Ordenar las variables por su posición en la fórmula
  return [...variables].sort((a, b) => {
    const posA = symbolPositions.get(a.symbol) ?? Infinity;
    const posB = symbolPositions.get(b.symbol) ?? Infinity;
    return posA - posB;
  });
}
