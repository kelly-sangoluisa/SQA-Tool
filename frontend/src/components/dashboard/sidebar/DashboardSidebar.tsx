"use client";
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { HiFolder, HiChartBar, HiSearch, HiLogout, HiCheckCircle } from 'react-icons/hi';
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
  const { signOut, user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAdmin = user?.role?.name === 'admin';

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error durante el logout:', error);
      router.replace('/auth/login');
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  const {
    recentProjects,
    recentEvaluations,
    loadingProjects,
    loadingEvaluations,
  } = useSidebarData();

  // Separar proyectos en progreso y completados
  const inProgressProjects = useMemo(() => {
    return recentProjects
      .filter(p => p.status !== 'completed')
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 3);
  }, [recentProjects]);

  const completedProjects = useMemo(() => {
    return recentProjects
      .filter(p => p.status === 'completed')
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 3);
  }, [recentProjects]);

  // Filtrar proyectos en progreso según la búsqueda
  const filteredInProgressProjects = useMemo(() => {
    if (!searchQuery.trim()) return inProgressProjects;
    
    const query = searchQuery.toLowerCase();
    return inProgressProjects.filter(project =>
      project.project_name.toLowerCase().includes(query)
    );
  }, [inProgressProjects, searchQuery]);

  // Filtrar proyectos completados según la búsqueda
  const filteredCompletedProjects = useMemo(() => {
    if (!searchQuery.trim()) return completedProjects;
    
    const query = searchQuery.toLowerCase();
    return completedProjects.filter(project =>
      project.project_name.toLowerCase().includes(query)
    );
  }, [completedProjects, searchQuery]);

  return (
    <>
      <SidebarToggle isOpen={isOpen} onToggle={toggleSidebar} />

      <aside className={`${styles.sidebar} ${!isOpen ? styles.closed : ''}`}>
        {/* Header simplificado: solo lupa - No mostrar para admin */}
        {!isAdmin && (
          <div className={styles.sidebarHeader}>
            <SidebarSearch 
              onSearchChange={setSearchQuery}
              isSearching={isSearching}
              onSearchToggle={setIsSearching}
            />
          </div>
        )}

        <div className={`${styles.sidebarContent} ${isAdmin ? styles.sidebarContentAdmin : ''}`}>
          {/* Sección de búsqueda expandida - Solo para evaluadores */}
          {!isAdmin && isSearching && (
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

          {/* Contenido específico según el rol */}
          {isAdmin ? (
            <>
              {/* Para Administrador: secciones informativas */}
              <div className={styles.adminSection}>
                <div className={styles.adminHeader}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <h3 className={styles.adminHeaderTitle}>Panel de Administración</h3>
                    <p className={styles.adminHeaderSubtitle}>Sistema SQA Tool</p>
                  </div>
                </div>

                <div className={styles.adminMenu}>
                  <div className={styles.adminMenuItem}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <div className={styles.adminMenuItemContent}>
                      <span className={styles.adminMenuItemTitle}>Estándares</span>
                      <span className={styles.adminMenuItemDesc}>Gestionar estándares de calidad</span>
                    </div>
                  </div>

                  <div className={styles.adminMenuItem}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <div className={styles.adminMenuItemContent}>
                      <span className={styles.adminMenuItemTitle}>Criterios</span>
                      <span className={styles.adminMenuItemDesc}>Configurar criterios de evaluación</span>
                    </div>
                  </div>

                  <div className={styles.adminMenuItem}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <div className={styles.adminMenuItemContent}>
                      <span className={styles.adminMenuItemTitle}>Métricas</span>
                      <span className={styles.adminMenuItemDesc}>Definir métricas y fórmulas</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Botón Dashboard - solo para evaluadores */}
              <BackToHomeButton />
              
              {/* Botón Nueva Evaluación - solo para evaluadores */}
              <NewEvaluationButton />

              {/* Proyectos Recientes (En Progreso) */}
              <SidebarSection
                title="Proyectos Recientes"
                icon={HiFolder}
                viewAllLink="/dashboard"
                viewAllText="Ver todos los proyectos"
                loading={loadingProjects}
                isEmpty={filteredInProgressProjects.length === 0}
                emptyMessage={searchQuery.trim() ? "No se encontraron proyectos" : "No hay proyectos recientes"}
              >
                {filteredInProgressProjects.map((project) => (
                  <ProjectListItem 
                    key={project.project_id} 
                    project={project}
                    linkTo={`/data-entry/${project.project_id}`}
                  />
                ))}
              </SidebarSection>

              {/* Proyectos Terminados Recientemente */}
              <SidebarSection
                title="Proyectos Terminados"
                icon={HiCheckCircle}
                viewAllLink="/results"
                viewAllText="Ver todos los proyectos"
                loading={loadingProjects}
                isEmpty={filteredCompletedProjects.length === 0}
                emptyMessage={searchQuery.trim() ? "No se encontraron proyectos completados" : "No hay proyectos completados"}
              >
                {filteredCompletedProjects.map((project) => (
                  <ProjectListItem 
                    key={project.project_id} 
                    project={project}
                    linkTo={`/results/project/${project.project_id}/report`}
                  />
                ))}
              </SidebarSection>
            </>
          )}

          {/* Botón Cerrar Sesión */}
          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className={styles.logoutButton}
            aria-label="Cerrar sesión"
          >
            <HiLogout size={20} />
            <span>Cerrar Sesión</span>
          </button>
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
