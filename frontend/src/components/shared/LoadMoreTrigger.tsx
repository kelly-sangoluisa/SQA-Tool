/**
 * Componente reutilizable para indicador de carga en scroll infinito
 */

interface LoadMoreTriggerProps {
  readonly observerRef: React.RefObject<HTMLDivElement | null>;
  readonly message?: string;
}

export function LoadMoreTrigger({ observerRef, message = 'Cargando más...' }: LoadMoreTriggerProps) {
  return (
    <div ref={observerRef} className="load-more-trigger">
      <div className="loader-small"></div>
      <p>{message}</p>
      
      <style>{`
        .load-more-trigger {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .loader-small {
          width: 32px;
          height: 32px;
          border: 3px solid #f1f5f9;
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 0.75rem;
        }

        .load-more-trigger p {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
