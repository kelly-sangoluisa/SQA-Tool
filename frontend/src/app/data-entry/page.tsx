'use client';

import { useState } from 'react';
import { MetricCard } from '@/components/data-entry/MetricCard';
import { EvaluationSidebar } from '@/components/data-entry/EvaluationSidebar';
import '@/styles/data-entry/data-entry.css';

// Datos de ejemplo - reemplaza con tus datos reales
const evaluationData = [
  {
    standard: "Standard 1",
    metrics: [
      {
        number: 1,
        name: "Metrica de Ejemplo 1",
        description: "Esta es una descripción de ejemplo para la métrica 1 que explica su propósito y uso en la evaluación.",
        formula: "A + B * C",
        variables: [
          { symbol: "A", description: "Descripción de variable A" },
          { symbol: "B", description: "Descripción de variable B" },
          { symbol: "C", description: "Descripción de variable C" }
        ]
      },
      {
        number: 2,
        name: "Metrica de Ejemplo 2",
        description: "Descripción detallada de la métrica 2 con información relevante para su comprensión.",
        formula: "X / Y",
        variables: [
          { symbol: "X", description: "Descripción de variable X" },
          { symbol: "Y", description: "Descripción de variable Y" }
        ]
      },
      {
        number: 3,
        name: "Metrica de Ejemplo 3",
        description: "Explicación completa de la métrica 3 y su aplicación práctica.",
        formula: "D^2 + E",
        variables: [
          { symbol: "D", description: "Descripción de variable D" },
          { symbol: "E", description: "Descripción de variable E" }
        ]
      },
      {
        number: 4,
        name: "Metrica de Ejemplo 4",
        description: "Información detallada sobre la métrica 4 y su importancia.",
        formula: "F * G - H",
        variables: [
          { symbol: "F", description: "Descripción de variable F" },
          { symbol: "G", description: "Descripción de variable G" },
          { symbol: "H", description: "Descripción de variable H" }
        ]
      }
    ]
  },
  {
    standard: "Standard 2", 
    metrics: [
      {
        number: 1,
        name: "Otra Métrica 1",
        description: "Descripción de otra métrica del segundo estándar.",
        formula: "P + Q",
        variables: [
          { symbol: "P", description: "Descripción de variable P" },
          { symbol: "Q", description: "Descripción de variable Q" }
        ]
      },
      {
        number: 2,
        name: "Otra Métrica 2",
        description: "Segunda métrica del estándar 2 con su descripción.",
        formula: "R * S / T",
        variables: [
          { symbol: "R", description: "Descripción de variable R" },
          { symbol: "S", description: "Descripción de variable S" },
          { symbol: "T", description: "Descripción de variable T" }
        ]
      }
    ]
  }
];

export default function EnterDataPage() {
  const [activeStandard, setActiveStandard] = useState(0);
  const [activeMetric, setActiveMetric] = useState(0);
  
  // Estado para almacenar los valores de cada métrica
  const [metricValues, setMetricValues] = useState<Record<string, Record<string, string>>>({});
  
  // Estado para marcar métricas como completadas
  const [completedMetrics, setCompletedMetrics] = useState<Set<string>>(new Set());

  const currentStandard = evaluationData[activeStandard];
  const currentMetric = currentStandard?.metrics[activeMetric];

  // Función para generar clave única de métrica
  const getMetricKey = (standardIndex: number, metricIndex: number) => 
    `${standardIndex}-${metricIndex}`;

  // Función para obtener valores de la métrica actual
  const getCurrentMetricValues = () => {
    const key = getMetricKey(activeStandard, activeMetric);
    return metricValues[key] || {};
  };

  // Función para actualizar valores de variables
  const updateMetricValue = (variableSymbol: string, value: string) => {
    const key = getMetricKey(activeStandard, activeMetric);
    setMetricValues(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [variableSymbol]: value
      }
    }));
  };

  // Función para marcar métrica como completada
  const markAsCompleted = () => {
    const key = getMetricKey(activeStandard, activeMetric);
    const currentValues = getCurrentMetricValues();
    const allVariablesFilled = currentMetric?.variables.every(variable => 
      currentValues[variable.symbol] && currentValues[variable.symbol].trim() !== ''
    );
    
    if (allVariablesFilled) {
      setCompletedMetrics(prev => new Set([...prev, key]));
    }
  };

  // Función para ir a la siguiente métrica
  const goToNext = () => {
    markAsCompleted();
    
    const totalMetricsInCurrentStandard = currentStandard?.metrics.length || 0;
    const isLastMetricInStandard = activeMetric === totalMetricsInCurrentStandard - 1;
    const isLastStandard = activeStandard === evaluationData.length - 1;

    if (isLastMetricInStandard) {
      if (!isLastStandard) {
        // Ir al primer métrica del siguiente estándar
        setActiveStandard(activeStandard + 1);
        setActiveMetric(0);
      } else {
        // Es la última métrica - aquí podrías abrir un modal de finalización
        alert('¡Evaluación completada! 🎉');
      }
    } else {
      // Siguiente métrica en el mismo estándar
      setActiveMetric(activeMetric + 1);
    }
  };

  // Función para ir a la métrica anterior
  const goToPrevious = () => {
    if (activeMetric > 0) {
      // Métrica anterior en el mismo estándar
      setActiveMetric(activeMetric - 1);
    } else if (activeStandard > 0) {
      // Última métrica del estándar anterior
      const previousStandard = evaluationData[activeStandard - 1];
      setActiveStandard(activeStandard - 1);
      setActiveMetric(previousStandard.metrics.length - 1);
    }
  };

  // Verificar si es la primera métrica
  const isFirstMetric = activeStandard === 0 && activeMetric === 0;
  
  // Verificar si es la última métrica
  const isLastMetric = activeStandard === evaluationData.length - 1 && 
                       activeMetric === (currentStandard?.metrics.length || 0) - 1;

  const handleStandardClick = (standardIndex: number) => {
    setActiveStandard(standardIndex);
    setActiveMetric(0); // Reset to first metric when switching standards
  };

  const handleMetricClick = (standardIndex: number, metricIndex: number) => {
    setActiveStandard(standardIndex);
    setActiveMetric(metricIndex);
  };

  return (
    <div className="enterDataLayout">
      
      
      <div className="mainContent">
        <EvaluationSidebar
            evaluationData={evaluationData}
            activeStandard={activeStandard}
            activeMetric={activeMetric}
            completedMetrics={completedMetrics}
            onStandardClick={handleStandardClick}
            onMetricClick={handleMetricClick}
        />

        <div className="content">
          <div className="currentStandardHeader">
            <h2 className="standardTitle">{currentStandard?.standard}</h2>
          </div>
          
          {currentMetric && (
            <div className="metricContainer">
              <MetricCard
                number={currentMetric.number}
                name={currentMetric.name}
                description={currentMetric.description}
                formula={currentMetric.formula}
                variables={currentMetric.variables}
                values={getCurrentMetricValues()}
                onValueChange={updateMetricValue}
                onPrevious={goToPrevious}
                onNext={goToNext}
                isFirstMetric={isFirstMetric}
                isLastMetric={isLastMetric}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}