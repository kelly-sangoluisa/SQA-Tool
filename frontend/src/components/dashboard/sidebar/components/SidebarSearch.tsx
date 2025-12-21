import React from 'react';
import { HiSearch } from 'react-icons/hi';
import styles from '../DashboardSidebar.module.css';

interface SidebarSearchProps {
  onSearchChange: (query: string) => void;
  isSearching: boolean;
  onSearchToggle: (searching: boolean) => void;
}

export function SidebarSearch({ onSearchToggle, isSearching }: Readonly<SidebarSearchProps>) {
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
