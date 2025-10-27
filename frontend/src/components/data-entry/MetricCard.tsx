import { Input } from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import styles from './MetricCard.module.css';

interface Variable {
  symbol: string;
  description: string;
}

interface MetricCardProps {
  number: number;
  name: string;
  description: string;
  formula: string;
  variables: Variable[];
}

export function MetricCard({ number, name, description, formula, variables }: Readonly<MetricCardProps>) {
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
                {variables.map((variable, index) => (
                  <div key={variable.symbol} className={styles.variableDefinition}>
                    <span className={styles.variableSymbol}>{variable.symbol}</span>
                    <span className={styles.equals}>=</span>
                    <span className={styles.variableDescription}>{variable.description}</span>
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
              {variables.map((variable, index) => (
                <div key={variable.symbol} className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    {variable.symbol} =
                  </label>
                  <Input 
                    type="number" 
                    placeholder="0"
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
        <Button variant="secondary" size="lg">
          ANTERIOR
        </Button>
        <Button variant="primary" size="lg">
          SIGUIENTE
        </Button>
      </div>
    </div>
  );
}