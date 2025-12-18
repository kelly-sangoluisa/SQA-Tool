import { Input } from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { sortVariablesByFormulaOrder } from '@/utils/formulaUtils';
import type { Variable } from '@/types/data-entry/data-entry.types';
import styles from './MetricCard.module.css';

interface MetricCardProps {
  number: number;
  name: string;
  description: string;
  formula: string;
  variables: Variable[];
  values?: Record<string, string>;
  onValueChange?: (variableSymbol: string, value: string) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onFinishEvaluation?: () => void;
  onFinishProject?: () => void;
  isFirstMetric?: boolean;
  isLastMetric?: boolean;
  isLastEvaluation?: boolean;
  allVariablesFilled?: boolean;
}

export function MetricCard({ 
  number, 
  name, 
  description, 
  formula, 
  variables,
  values = {},
  onValueChange,
  onPrevious,
  onNext,
  onFinishEvaluation,
  onFinishProject,
  isFirstMetric = false,
  isLastMetric = false,
  isLastEvaluation = false,
  allVariablesFilled = false
}: Readonly<MetricCardProps>) {

  // Ordenar variables según aparición en la fórmula
  const sortedVariables = sortVariablesByFormulaOrder(formula, variables);

  const handleInputChange = (variableSymbol: string, value: string) => {
    onValueChange?.(variableSymbol, value);
  };

  // Determinar qué acción tomar con el botón principal
  const handlePrimaryAction = () => {
    if (isLastMetric && isLastEvaluation && allVariablesFilled) {
      // Última métrica de la última evaluación → Terminar Proyecto
      onFinishProject?.();
    } else if (isLastMetric && allVariablesFilled) {
      // Última métrica de una evaluación → Terminar Evaluación
      onFinishEvaluation?.();
    } else {
      // Métrica normal → Siguiente
      onNext?.();
    }
  };

  // Determinar el texto del botón
  const getPrimaryButtonText = () => {
    if (isLastMetric && isLastEvaluation && allVariablesFilled) {
      return 'TERMINAR PROYECTO';
    } else if (isLastMetric && allVariablesFilled) {
      return 'TERMINAR EVALUACIÓN';
    } else {
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
              {sortedVariables.map((variable) => (
                <div key={variable.symbol} className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    {variable.symbol} =
                  </label>
                  <Input 
                    type="number" 
                    placeholder="0"
                    value={values[variable.symbol] || ''}
                    onChange={(e) => handleInputChange(variable.symbol, e.target.value)}
                    className={styles.valueInput}
                  />
                </div>
              ))}
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
          disabled={!allVariablesFilled}
        >
          {getPrimaryButtonText()}
        </Button>
      </div>
    </div>
  );
}