'use client';

import '@/styles/reports/score-gauge.css';

interface ScoreGaugeProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  threshold?: number | null; // Umbral opcional para mostrar la línea
}

export function ScoreGauge({ score, size = 'medium', showLabel = true, threshold = null }: ScoreGaugeProps) {
  // Validar que score sea un número válido
  const validScore = typeof score === 'number' && !isNaN(score) ? score : 0;
  const validThreshold = threshold !== null && typeof threshold === 'number' && !isNaN(threshold) ? threshold : null;
  
  const getColor = (value: number) => {
    if (value >= 80) return '#10b981';
    if (value >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getLabel = (value: number) => {
    if (value >= 80) return 'Excelente';
    if (value >= 60) return 'Bueno';
    return 'Necesita mejora';
  };

  const sizes = {
    small: { width: 120, height: 120, stroke: 8, fontSize: '1.5rem', labelSize: '0.75rem' },
    medium: { width: 180, height: 180, stroke: 12, fontSize: '2.5rem', labelSize: '0.875rem' },
    large: { width: 240, height: 240, stroke: 16, fontSize: '3.5rem', labelSize: '1rem' },
  };

  const config = sizes[size];
  const radius = (config.width / 2) - config.stroke;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (validScore / 100) * circumference;
  const color = getColor(validScore);

  // Calcular posición de la línea del umbral si existe
  const thresholdAngle = validThreshold !== null ? (validThreshold / 100) * 360 - 90 : null;
  const thresholdRadians = thresholdAngle !== null ? (thresholdAngle * Math.PI) / 180 : null;
  
  // Coordenadas para la línea del umbral (desde el borde interno hasta el externo)
  const innerRadius = radius - config.stroke / 2;
  const outerRadius = radius + config.stroke / 2;
  const centerX = config.width / 2;
  const centerY = config.height / 2;

  return (
    <div className="score-gauge">
      <svg width={config.width} height={config.height} className="gauge-svg">
        {/* Círculo de fondo */}
        <circle
          cx={config.width / 2}
          cy={config.height / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={config.stroke}
        />
        
        {/* Círculo de progreso */}
        <circle
          cx={config.width / 2}
          cy={config.height / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={config.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${config.width / 2} ${config.height / 2})`}
          className="gauge-progress"
        />
        
        {/* Línea indicadora del umbral */}
        {thresholdRadians !== null && (
          <line
            x1={centerX + innerRadius * Math.cos(thresholdRadians)}
            y1={centerY + innerRadius * Math.sin(thresholdRadians)}
            x2={centerX + outerRadius * Math.cos(thresholdRadians)}
            y2={centerY + outerRadius * Math.sin(thresholdRadians)}
            stroke="#dc2626"
            strokeWidth="4"
            strokeLinecap="round"
            className="threshold-marker"
          />
        )}
        
        {/* Texto del score */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy="0.3em"
          className="gauge-text"
          style={{ fontSize: config.fontSize }}
        >
          {validScore.toFixed(1)}
        </text>
      </svg>
      
      {showLabel && (
        <p className="gauge-label" style={{ fontSize: config.labelSize }}>
          {getLabel(validScore)}
        </p>
      )}
    </div>
  );
}
