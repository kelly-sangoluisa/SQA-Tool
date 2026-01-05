import { useState } from 'react';
import { Input } from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { Toast, type ToastType } from '@/components/shared/Toast';
import { sortVariablesByFormulaOrder } from '@/utils/formulaUtils';
import { isVariableFixed } from '@/utils/thresholdUtils';
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
    onValueChange?.(variableSymbol, value);
  };

  // Validar que solo se ingresen números enteros positivos
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    // Permitir solo números enteros (sin punto ni coma)
    if (!/^\d+$/.test(text)) {
      e.preventDefault();
      setToast({
        message: 'Solo se permiten números enteros (sin decimales ni símbolos)',
        type: 'warning',
        isVisible: true
      });
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
                      onKeyDown={handleKeyDown}
                      onPaste={handlePaste}
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