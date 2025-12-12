"use client";
import React, { useState, useMemo } from 'react';
import { HiFolder, HiChartBar, HiSearch } from 'react-icons/hi';
import { SidebarToggle } from './components/SidebarToggle';
import { NewEvaluationButton } from './components/NewEvaluationButton';
import { BackToHomeButton } from './components/BackToHomeButton';
import { SidebarSearch } from './components/SidebarSearch';
import { SidebarSection } from './components/SidebarSection';
import { ProjectListItem } from './components/ProjectListItem';
import { EvaluationListItem } from './components/EvaluationListItem';
import { useSidebarData } from './hooks/useSidebarData';
import { useSidebar } from './context/SidebarContext';
import styles from './DashboardSidebar.module.css';

export function DashboardSidebar() {
  const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const {
    recentProjects,
    recentEvaluations,
    loadingProjects,
    loadingEvaluations,
  } = useSidebarData();

  // Filtrar proyectos según la búsqueda
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return recentProjects;
    
    const query = searchQuery.toLowerCase();
    return recentProjects.filter(project =>
      project.project_name.toLowerCase().includes(query)
    );
  }, [recentProjects, searchQuery]);

  // Filtrar evaluaciones según la búsqueda
  const filteredEvaluations = useMemo(() => {
    if (!searchQuery.trim()) return recentEvaluations;
    
    const query = searchQuery.toLowerCase();
    return recentEvaluations.filter(evaluation =>
      evaluation.project_name.toLowerCase().includes(query) ||
      evaluation.standard_name.toLowerCase().includes(query)
    );
  }, [recentEvaluations, searchQuery]);

  return (
    <>
      <SidebarToggle isOpen={isOpen} onToggle={toggleSidebar} />

      <aside className={`${styles.sidebar} ${!isOpen ? styles.closed : ''}`}>
        {/* Header simplificado: solo lupa */}
        <div className={styles.sidebarHeader}>
          <SidebarSearch 
            onSearchChange={setSearchQuery}
            isSearching={isSearching}
            onSearchToggle={setIsSearching}
          />
        </div>

        <div className={styles.sidebarContent}>
          {/* Sección de búsqueda expandida */}
          {isSearching && (
            <div className={styles.searchSection}>
              <div className={styles.searchInputWrapper}>
                <HiSearch size={18} className={styles.searchInputIcon} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className={styles.searchInput}
                  autoFocus
                />
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearching(false);
                  }}
                  className={styles.searchClearBtn}
                  aria-label="Cerrar búsqueda"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Botón Dashboard */}
          <BackToHomeButton />
          
          {/* Botón Nueva Evaluación */}
          <NewEvaluationButton />

          <SidebarSection
            title="Proyectos Recientes"
            icon={HiFolder}
            viewAllLink="/results"
            viewAllText="Ver todos los proyectos"
            loading={loadingProjects}
            isEmpty={filteredProjects.length === 0}
            emptyMessage={searchQuery.trim() ? "No se encontraron proyectos" : "No hay proyectos recientes"}
          >
            {filteredProjects.map((project) => (
              <ProjectListItem key={project.project_id} project={project} />
            ))}
          </SidebarSection>

          <SidebarSection
            title="Evaluaciones Recientes"
            icon={HiChartBar}
            viewAllLink="/results"
            viewAllText="Ver todas las evaluaciones"
            loading={loadingEvaluations}
            isEmpty={filteredEvaluations.length === 0}
            emptyMessage={searchQuery.trim() ? "No se encontraron evaluaciones" : "No hay evaluaciones recientes"}
          >
            {filteredEvaluations.map((evaluation) => (
              <EvaluationListItem key={evaluation.evaluation_id} evaluation={evaluation} />
            ))}
          </SidebarSection>
        </div>
      </aside>

      {isOpen && (
        <div 
          className={styles.overlay} 
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
    </>
  );
}
