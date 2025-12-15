"use client";
<<<<<<< HEAD

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { HiFolder, HiChartBar, HiSearch, HiLogout } from "react-icons/hi";

import { useAuth } from "@/hooks/auth/useAuth";
import { SidebarToggle } from "./components/SidebarToggle";
import { NewEvaluationButton } from "./components/NewEvaluationButton";
import { BackToHomeButton } from "./components/BackToHomeButton";
import { SidebarSearch } from "./components/SidebarSearch";
import { SidebarSection } from "./components/SidebarSection";
import { ProjectListItem } from "./components/ProjectListItem";
import { EvaluationListItem } from "./components/EvaluationListItem";

import { useSidebarData } from "./hooks/useSidebarData";
import { useSidebar } from "./context/SidebarContext";
import styles from "./DashboardSidebar.module.css";
=======
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
>>>>>>> 7b19fc67af1d22e9da8bd04aa3e0d409483e7d44

export function DashboardSidebar() {
  const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
  const { signOut } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const {
    recentProjects,
    recentEvaluations,
    loadingProjects,
    loadingEvaluations,
  } = useSidebarData();

<<<<<<< HEAD
  /* ---------------- LOGOUT ---------------- */
  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error durante el logout:", error);
      router.replace("/auth/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  /* ---------------- PROYECTOS ---------------- */
  const filteredProjects = useMemo(() => {
    return recentProjects
      .filter(
        (project) =>
          project.status?.toLowerCase() === "in_progress"
      )
      .filter((project) =>
        searchQuery.trim()
          ? project.project_name
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
          : true
      );
  }, [recentProjects, searchQuery]);

  /* ---------------- EVALUACIONES ---------------- */
  const filteredEvaluations = useMemo(() => {
    return recentEvaluations
      .filter(
        (evaluation) =>
          evaluation.status?.toLowerCase() === "in_progress"
      )
      .filter((evaluation) =>
        searchQuery.trim()
          ? evaluation.project_name
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            evaluation.standard_name
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
          : true
      );
  }, [recentEvaluations, searchQuery]);
=======
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
>>>>>>> 7b19fc67af1d22e9da8bd04aa3e0d409483e7d44

  return (
    <>
      <SidebarToggle isOpen={isOpen} onToggle={toggleSidebar} />

      <aside className={`${styles.sidebar} ${!isOpen ? styles.closed : ""}`}>
        {/* HEADER */}
        <div className={styles.sidebarHeader}>
          <SidebarSearch
            onSearchChange={setSearchQuery}
            isSearching={isSearching}
            onSearchToggle={setIsSearching}
          />
        </div>

        <div className={styles.sidebarContent}>
          {/* SEARCH */}
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
                    setSearchQuery("");
                    setIsSearching(false);
                  }}
                  className={styles.searchClearBtn}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <BackToHomeButton />
          <NewEvaluationButton />

<<<<<<< HEAD
          {/* PROYECTOS */}
=======
          {/* Proyectos Recientes (En Progreso) */}
>>>>>>> 7b19fc67af1d22e9da8bd04aa3e0d409483e7d44
          <SidebarSection
            title="Proyectos Recientes"
            icon={HiFolder}
            viewAllLink="/dashboard"
            viewAllText="Ver todos los proyectos"
            loading={loadingProjects}
<<<<<<< HEAD
            isEmpty={filteredProjects.length === 0}
            emptyMessage={
              searchQuery
                ? "No se encontraron proyectos"
                : "No hay proyectos en progreso"
            }
          >
            {filteredProjects.map((project) => (
              <ProjectListItem
                key={project.project_id}
                project={project}
=======
            isEmpty={filteredInProgressProjects.length === 0}
            emptyMessage={searchQuery.trim() ? "No se encontraron proyectos" : "No hay proyectos recientes"}
          >
            {filteredInProgressProjects.map((project) => (
              <ProjectListItem 
                key={project.project_id} 
                project={project}
                linkTo={`/data-entry/${project.project_id}`}
>>>>>>> 7b19fc67af1d22e9da8bd04aa3e0d409483e7d44
              />
            ))}
          </SidebarSection>

<<<<<<< HEAD
          {/* EVALUACIONES */}
          <SidebarSection
            title="Evaluaciones Recientes"
            icon={HiChartBar}
            loading={loadingEvaluations}
            isEmpty={filteredEvaluations.length === 0}
            emptyMessage={
              searchQuery
                ? "No se encontraron evaluaciones"
                : "No hay evaluaciones en progreso"
            }
          >
            {filteredEvaluations.map((evaluation) => (
              <EvaluationListItem
                key={evaluation.evaluation_id}
                evaluation={evaluation}
=======
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
>>>>>>> 7b19fc67af1d22e9da8bd04aa3e0d409483e7d44
              />
            ))}
          </SidebarSection>

          {/* LOGOUT */}
          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className={styles.logoutButton}
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
