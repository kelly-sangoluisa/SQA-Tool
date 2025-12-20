import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Autocomplete.module.css';

interface AutocompleteProps<T> {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSelect: (item: T) => void;
  readonly searchFunction: (query: string) => Promise<T[]>;
  readonly getItemLabel: (item: T) => string;
  readonly getItemDescription?: (item: T) => string;
  readonly getItemMeta?: (item: T) => React.ReactNode;
  readonly placeholder?: string;
  readonly minChars?: number;
  readonly debounceMs?: number;
  readonly disabled?: boolean;
  readonly helperText?: string;
  readonly name?: string;
  readonly required?: boolean;
}

export function Autocomplete<T>({
  value,
  onChange,
  onSelect,
  searchFunction,
  getItemLabel,
  getItemDescription,
  getItemMeta,
  placeholder = 'Buscar...',
  minChars = 2,
  debounceMs = 300,
  disabled = false,
  helperText,
  name,
  required = false,
}: AutocompleteProps<T>) {
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle search with debounce
  const performSearch = useCallback(
    async (query: string) => {
      if (query.trim().length < minChars) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await searchFunction(query);
        // Eliminar duplicados basados en el label del item
        const uniqueResults = data.filter((item, index, self) => 
          index === self.findIndex((t) => getItemLabel(t) === getItemLabel(item))
        );
        setResults(uniqueResults);
        setShowResults(true);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error('Error searching:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [searchFunction, minChars, getItemLabel]
  );

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(value);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, performSearch, debounceMs]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowResults(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSelect = (item: T) => {
    const label = getItemLabel(item);
    onChange(label);
    onSelect(item);
    setShowResults(false);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={styles.autocompleteWrapper} ref={wrapperRef}>
      <input // NOSONAR typescript:S6819 - ARIA combobox pattern required for accessible autocomplete
        ref={inputRef}
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`${styles.autocompleteInput} ${
          showResults && results.length > 0 ? styles.hasResults : ''
        }`}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showResults && results.length > 0}
        aria-controls={showResults && results.length > 0 ? 'autocomplete-results' : undefined}
      />

      {showResults && (
        <div // NOSONAR typescript:S6819 - ARIA listbox pattern required for accessible autocomplete with dynamic results
          className={styles.resultsList}
          role="listbox"
          id="autocomplete-results"
        >
          {(() => {
            if (isLoading) {
              return (
                <div className={styles.statusItem}>
                  <div className={styles.loading}>Buscando...</div>
                </div>
              );
            }
            
            if (results.length === 0) {
              return (
                <div className={styles.statusItem}>
                  <div className={styles.noResults}>
                    No se encontraron resultados para &quot;{value}&quot;
                  </div>
                </div>
              );
            }
            
            return results.map((item, index) => {
              const itemKey = `result-${getItemLabel(item)}-${index}`;
              const isHighlighted = index === highlightedIndex;
              
              return (
                <div // NOSONAR typescript:S6819 - ARIA option role required for listbox pattern
                  key={itemKey}
                  role="option"
                  aria-selected={isHighlighted}
                  className={`${styles.resultItem} ${
                    isHighlighted ? styles.highlighted : ''
                  }`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(item);
                    }
                  }}
                  tabIndex={-1}
                >
                  <div className={styles.resultItemName}>
                    {getItemLabel(item)}
                  </div>
                  {getItemMeta && (
                    <div className={styles.resultItemMeta}>
                      {getItemMeta(item)}
                    </div>
                  )}
                  {getItemDescription && (
                    <div className={styles.resultItemDescription}>
                      {getItemDescription(item)}
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      )}

      {helperText && !showResults && (
        <div className={styles.helperText}>{helperText}</div>
      )}
    </div>
  );
}
