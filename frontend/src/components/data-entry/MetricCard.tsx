import { useState } from 'react';
import { Input } from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { Toast, type ToastType } from '@/components/shared/Toast';
import { sortVariablesByFormulaOrder } from '@/utils/data-entry/formulaUtils';
import { isVariableFixed } from '@/utils/data-entry/thresholdUtils';
import { isDenominatorVariable } from '@/utils/data-entry/divisionUtils';
import type { Variable } from '@/types/data-entry/data-entry.types';
import styles from './MetricCard.module.css';

export type PrimaryButtonAction = 'next' | 'finish-evaluation' | 'finish-project' | 'disabled';

interface MetricCardProps {
  number: number;
  name: string;
  description: string;
  formula: string;
  desiredThreshold?: string | null;
  worstCase?: string | null;
  variables: Variable[];
  values?: Record<string, string>;
  onValueChange?: (variableSymbol: string, value: string) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onFinishEvaluation?: () => void;
  onFinishProject?: () => void;
  isFirstMetric?: boolean;
  primaryAction: PrimaryButtonAction;
}

export function MetricCard({ 
  number, 
  name, 
  description, 
  formula,
  desiredThreshold,
  worstCase,
  variables,
  values = {},
  onValueChange,
  onPrevious,
  onNext,
  onFinishEvaluation,
  onFinishProject,
  isFirstMetric = false,
  primaryAction
}: Readonly<MetricCardProps>) {

  // Estado para el toast de validación
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'warning',
    isVisible: false
  });

  // Ordenar variables según aparición en la fórmula
  const sortedVariables = sortVariablesByFormulaOrder(formula, variables);

  const handleInputChange = (variableSymbol: string, value: string) => {
    // Si el valor es 0 y la variable es denominador, mostrar error
    if (value === '0' && isDenominatorVariable(variableSymbol, formula)) {
      setToast({
        message: 'No se puede ingresar 0 en esta variable (división por cero)',
        type: 'error',
        isVisible: true
      });
      return; // No actualizar el valor
    }
    
    onValueChange?.(variableSymbol, value);
  };

  // Crear handler de teclado específico para cada variable
  const createKeyDownHandler = (variableSymbol: string) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir: backspace, delete, tab, escape, enter, flechas
    if (
      ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
    ) {
      return;
    }
    
    // Permitir Ctrl/Cmd+A, Ctrl/Cmd+C, Ctrl/Cmd+V, Ctrl/Cmd+X
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
      return;
    }
    
    // Bloquear punto y coma (no permitir decimales)
    if (e.key === '.' || e.key === ',') {
      e.preventDefault();
      setToast({
        message: 'Solo se permiten números enteros (sin decimales)',
        type: 'warning',
        isVisible: true
      });
      return;
    }
    
    // Validación especial para 0 en denominadores
    if (e.key === '0') {
      const input = e.target as HTMLInputElement;
      const currentValue = input.value;
      const isDenominator = isDenominatorVariable(variableSymbol, formula);
      
      if (isDenominator) {
        // Obtener la posición del cursor
        const cursorStart = input.selectionStart || 0;
        const cursorEnd = input.selectionEnd || 0;
        
        // Simular el valor resultante después de escribir '0'
        const newValue = 
          currentValue.substring(0, cursorStart) + 
          '0' + 
          currentValue.substring(cursorEnd);
        
        // Bloquear solo si el valor final sería exactamente "0" (o "00", "000", etc)
        // Permitir valores como "10", "20", "100", "105", etc.
        const numValue = Number.parseInt(newValue, 10);
        if (numValue === 0) {
          e.preventDefault();
          setToast({
            message: 'No se puede usar 0 en el denominador de una división.',
            type: 'warning',
            isVisible: true
          });
          return;
        }
      }
    }
    
    // Bloquear si no es un número
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      setToast({
        message: 'Solo se permiten números (no letras ni símbolos)',
        type: 'warning',
        isVisible: true
      });
    }
  };

  // Crear handler de paste específico para cada variable
  const createPasteHandler = (variableSymbol: string) => (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const isDenominator = isDenominatorVariable(variableSymbol, formula);
    
    // Permitir solo números enteros (sin punto ni coma)
    if (!/^\d+$/.test(text)) {
      e.preventDefault();
      setToast({
        message: 'Solo se permiten números enteros (sin decimales ni símbolos)',
        type: 'warning',
        isVisible: true
      });
      return;
    }
    
    // Validación especial: no permitir pegar valores que resulten en 0
    // Permitir "10", "20", "100" etc., bloquear solo "0", "00", "000"
    if (isDenominator) {
      const numValue = Number.parseInt(text, 10);
      if (numValue === 0) {
        e.preventDefault();
        setToast({
          message: 'Esta variable no puede ser 0 (causaría división por cero)',
          type: 'error',
          isVisible: true
        });
      }
    }
  };

  // Validar campos antes de avanzar
  const validateFields = (): boolean => {
    // Verificar que todas las variables no fijas tengan valores válidos
    for (const variable of variables) {
      const fixedInfo = isVariableFixed(
        variable.symbol,
        formula,
        desiredThreshold || null,
        worstCase || null
      );
      
      // Si es fija, saltar validación
      if (fixedInfo.isFixed) continue;
      
      const value = values[variable.symbol];
      
      // Campo vacío
      if (!value || value.trim() === '') {
        setToast({
          message: 'Por favor completa todos los campos con valores válidos',
          type: 'warning',
          isVisible: true
        });
        return false;
      }
      
      // Verificar que sea un número no negativo
      const numValue = Number.parseFloat(value);
      if (Number.isNaN(numValue) || numValue < 0) {
        setToast({
          message: 'Por favor ingresa valores válidos (números no negativos)',
          type: 'warning',
          isVisible: true
        });
        return false;
      }
      
      // Validación especial: si es denominador, no puede ser 0
      if (numValue === 0 && isDenominatorVariable(variable.symbol, formula)) {
        setToast({
          message: 'No se puede usar 0 en esta variable (causaría división por cero)',
          type: 'error',
          isVisible: true
        });
        return false;
      }
    }
    
    return true;
  };

  // Ejecutar la acción del botón principal
  const handlePrimaryAction = () => {
    // Validar campos antes de continuar
    if (!validateFields()) {
      return;
    }
    
    switch (primaryAction) {
      case 'finish-project':
        onFinishProject?.();
        break;
      case 'finish-evaluation':
        onFinishEvaluation?.();
        break;
      case 'next':
        onNext?.();
        break;
      // 'disabled' no hace nada
    }
  };

  // Determinar el texto del botón
  const getPrimaryButtonText = (): string => {
    switch (primaryAction) {
      case 'finish-project':
        return 'TERMINAR PROYECTO';
      case 'finish-evaluation':
        return 'TERMINAR EVALUACIÓN';
      case 'next':
        return 'SIGUIENTE';
      case 'disabled':
        return 'SIGUIENTE';
    }
  };

  return (
    <div className={styles.metricCard}>
      {/* Header con número y título */}
      <div className={styles.header}>
        <div className={styles.number}>{number}</div>
        <div className={styles.titleSection}>
          <h3 className={styles.name}>{name}</h3>
          <p className={styles.description}>{description}</p>
        </div>
      </div>
      <h4 className={styles.formulaTitle}>{formula}</h4>
      
      {/* Contenido principal con dos columnas */}
      <div className={styles.mainContent}>
        {/* Columna izquierda: Descripción y fórmula */}
        <div className={styles.leftColumn}>
          <div className={styles.formulaSection}>
            {variables.length > 0 && (
              <div className={styles.variablesInfo}>
                <div className={styles.variablesTitle}>Donde:</div>
                {sortedVariables.map((variable) => (
                  <div key={variable.symbol} className={styles.variableDefinition}>
                    <span className={styles.variableSymbol}>{variable.symbol}</span>
                    <span className={styles.equals}>=</span>
                    <span className={styles.variableDescription}>{String(variable.description)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Columna derecha: Inputs para variables */}
        <div className={styles.rightColumn}>
          {variables.length > 0 && (
            <div className={styles.inputsSection}>
              {sortedVariables.map((variable) => {
                // Detectar si la variable es fija
                const fixedInfo = isVariableFixed(
                  variable.symbol,
                  formula,
                  desiredThreshold || null,
                  worstCase || null
                );
                const isFixed = fixedInfo.isFixed;
                const fixedValue = fixedInfo.fixedValue;

                // Si es fija y no tiene valor en el state, auto-completar
                if (isFixed && fixedValue !== undefined && !values[variable.symbol]) {
                  // Auto-completar valor fijo al montar
                  setTimeout(() => {
                    handleInputChange(variable.symbol, fixedValue.toString());
                  }, 0);
                }

                return (
                  <div key={variable.symbol} className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                      {variable.symbol} =
                    </label>
                    <Input 
                      type="number" 
                      placeholder={isFixed ? `Valor fijo: ${fixedValue}` : "Ej: 12"}
                      min="0"
                      step="any"
                      value={isFixed && fixedValue !== undefined ? fixedValue.toString() : (values[variable.symbol] || '')}
                      onChange={(e) => handleInputChange(variable.symbol, e.target.value)}
                      onKeyDown={createKeyDownHandler(variable.symbol)}
                      onPaste={createPasteHandler(variable.symbol)}
                      className={styles.valueInput}
                      disabled={isFixed}
                      readOnly={isFixed}
                      title={isFixed ? fixedInfo.reason : undefined}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Botones en la parte inferior */}
      <div className={styles.footer}>
        <Button 
          variant="secondary" 
          size="lg"
          onClick={onPrevious}
          disabled={isFirstMetric}
        >
          ANTERIOR
        </Button>
        <Button 
          variant="primary" 
          size="lg"
          onClick={handlePrimaryAction}
        >
          {getPrimaryButtonText()}
        </Button>
      </div>

      {/* Toast de validación */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
        duration={2000}
      />
    </div>
  );
}