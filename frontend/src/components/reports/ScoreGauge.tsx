'use client';

interface ScoreGaugeProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export function ScoreGauge({ score, size = 'medium', showLabel = true }: ScoreGaugeProps) {
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
  const offset = circumference - (score / 100) * circumference;
  const color = getColor(score);

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
        
        {/* Texto del score */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy="0.3em"
          className="gauge-text"
          style={{ fontSize: config.fontSize }}
        >
          {score.toFixed(1)}
        </text>
      </svg>
      
      {showLabel && (
        <p className="gauge-label" style={{ fontSize: config.labelSize }}>
          {getLabel(score)}
        </p>
      )}

      <style jsx>{`
        .score-gauge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .gauge-svg {
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
        }

        .gauge-progress {
          transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .gauge-text {
          font-weight: 800;
          fill: var(--color-primary-dark);
        }

        .gauge-label {
          font-weight: 700;
          color: var(--color-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
