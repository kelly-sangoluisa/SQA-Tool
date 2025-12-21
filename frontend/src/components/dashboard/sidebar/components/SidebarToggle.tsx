import React from 'react';
import { HiMenuAlt2 } from 'react-icons/hi';
import styles from '../DashboardSidebar.module.css';

interface SidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function SidebarToggle({ isOpen, onToggle }: Readonly<SidebarToggleProps>) {
  return (
    <button 
      className={`${styles.toggleButton} ${isOpen ? '' : styles.closed}`}
      onClick={onToggle}
      aria-label={isOpen ? "Cerrar sidebar" : "Abrir sidebar"}
      aria-expanded={isOpen}
    >
      <HiMenuAlt2 size={24} />
    </button>
  );
}
