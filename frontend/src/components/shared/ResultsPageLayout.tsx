import { ReactNode } from 'react';

interface ResultsPageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  backButton?: {
    label: string;
    onClick: () => void;
  };
  stats?: Array<{
    label: string;
    value: number | string;
    variant: 'total' | 'approved' | 'rejected' | 'pending' | 'completed';
  }>;
}

export function ResultsPageLayout({
  children,
  title,
  subtitle,
  backButton,
  stats
}: ResultsPageLayoutProps) {
  return (
    <div className="results-page">
      <div className="page-header">
        {backButton && (
          <button onClick={backButton.onClick} className="back-button">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {backButton.label}
          </button>
        )}

        <div className="header-content">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}

          {stats && stats.length > 0 && (
            <div className="stats-summary">
              {stats.map((stat, index) => (
                <div key={index} className={`stat-chip stat-chip--${stat.variant}`}>
                  <span className="stat-number">{stat.value}</span>
                  <span className="stat-text">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {children}

      <style jsx>{`
        .results-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 2rem;
        }

        .page-header {
          max-width: 1200px;
          margin: 0 auto 3rem;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          color: var(--color-primary);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 1.5rem;
        }

        .back-button:hover {
          border-color: var(--color-primary);
          box-shadow: 0 4px 12px rgba(78, 94, 163, 0.15);
        }

        .header-content {
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.75rem 0;
          animation: fadeInDown 0.6s ease;
        }

        .page-subtitle {
          font-size: 1.125rem;
          color: #6b7280;
          margin: 0 0 1.5rem 0;
          max-width: 600px;
          animation: fadeInUp 0.6s ease;
        }

        .stats-summary {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          max-width: 500px;
        }

        @media (min-width: 640px) {
          .stats-summary {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            max-width: 100%;
          }
        }

        .stat-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 1rem;
          border-radius: 12px;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .stat-chip:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
        }

        .stat-chip--total { border-left: 4px solid var(--color-primary); }
        .stat-chip--approved { border-left: 4px solid #10b981; }
        .stat-chip--rejected { border-left: 4px solid #ef4444; }
        .stat-chip--pending { border-left: 4px solid #f59e0b; }
        .stat-chip--completed { border-left: 4px solid #10b981; }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          line-height: 1;
          min-width: 40px;
          text-align: center;
        }

        .stat-chip--total .stat-number { color: var(--color-primary); }
        .stat-chip--approved .stat-number { color: #10b981; }
        .stat-chip--rejected .stat-number { color: #ef4444; }
        .stat-chip--pending .stat-number { color: #f59e0b; }
        .stat-chip--completed .stat-number { color: #10b981; }

        .stat-text {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .results-page {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
