import React, { useState, useEffect } from 'react';
import { HiSearch } from 'react-icons/hi';
import styles from '../DashboardSidebar.module.css';

interface SidebarSearchProps {
  onSearchChange: (query: string) => void;
  isSearching: boolean;
  onSearchToggle: (searching: boolean) => void;
}

export function SidebarSearch({ onSearchChange, isSearching, onSearchToggle }: SidebarSearchProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      onSearchChange(query);
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [query, onSearchChange]);

  const _handleClose = () => {
    setQuery('');
    onSearchChange('');
    onSearchToggle(false);
  };

  return (
    <>
      {/* Botón lupa en el header */}
      <button 
        className={styles.searchButton}
        onClick={() => onSearchToggle(!isSearching)}
        aria-label="Buscar"
      >
        <HiSearch size={18} />
      </button>

      {/* Sección de búsqueda expandida en el contenido */}
    </>
  );
}
