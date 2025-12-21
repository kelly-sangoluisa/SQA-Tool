/**
 * Custom hook para implementar scroll infinito (lazy loading)
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  itemsPerPage: number;
  threshold?: number;
}

interface UseInfiniteScrollReturn<T> {
  displayedItems: T[];
  hasMore: boolean;
  observerTarget: React.RefObject<HTMLDivElement | null>;
  reset: () => void;
}

/**
 * Hook reutilizable para scroll infinito
 * @param items - Array completo de items a paginar
 * @param options - Configuración (items por página, threshold del observer)
 */
export function useInfiniteScroll<T>(
  items: T[],
  options: UseInfiniteScrollOptions
): UseInfiniteScrollReturn<T> {
  const { itemsPerPage, threshold = 0.1 } = options;
  const [displayCount, setDisplayCount] = useState(itemsPerPage);
  const observerTarget = useRef<HTMLDivElement>(null);

  const displayedItems = items.slice(0, displayCount);
  const hasMore = displayCount < items.length;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setDisplayCount(prev => prev + itemsPerPage);
    }
  }, [hasMore, itemsPerPage]);

  const reset = useCallback(() => {
    setDisplayCount(itemsPerPage);
  }, [itemsPerPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadMore, threshold]);

  return {
    displayedItems,
    hasMore,
    observerTarget,
    reset,
  };
}
