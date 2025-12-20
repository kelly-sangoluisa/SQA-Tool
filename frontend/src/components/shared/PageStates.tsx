interface LoadingStateProps {
  readonly message?: string;
}

export function LoadingState({ message = 'Cargando...' }: LoadingStateProps) {
  return (
    <div className="loading-state">
      <div className="loader"></div>
      <p>{message}</p>
      
      <style>{`
        .loading-state {
          max-width: 600px;
          margin: 4rem auto;
          text-align: center;
          padding: 3rem 2rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(78, 94, 163, 0.08);
        }

        .loader {
          width: 48px;
          height: 48px;
          border: 4px solid #f1f5f9;
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        p {
          color: #6b7280;
          margin: 1rem 0;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

interface ErrorStateProps {
  readonly message: string;
  readonly onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <p>{message}</p>
      {onRetry && (
        <button className="retry-btn" onClick={onRetry}>
          Reintentar
        </button>
      )}
      
      <style>{`
        .error-state {
          max-width: 600px;
          margin: 4rem auto;
          text-align: center;
          padding: 3rem 2rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(78, 94, 163, 0.08);
          border: 2px solid #ef4444;
        }

        svg {
          color: #ef4444;
          margin-bottom: 1rem;
        }

        p {
          color: #6b7280;
          margin: 1rem 0;
        }

        .retry-btn {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(78, 94, 163, 0.25);
        }
      `}</style>
    </div>
  );
}

interface EmptyStateProps {
  readonly message: string;
  readonly description?: string;
}

export function EmptyState({ message, description }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <h3>{message}</h3>
      {description && <p>{description}</p>}
      
      <style>{`
        .empty-state {
          max-width: 600px;
          margin: 4rem auto;
          text-align: center;
          padding: 3rem 2rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(78, 94, 163, 0.08);
        }

        svg {
          color: var(--color-primary);
          margin-bottom: 1rem;
        }

        h3 {
          color: var(--color-primary-dark);
          margin: 0 0 0.5rem 0;
        }

        p {
          color: #6b7280;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
}
