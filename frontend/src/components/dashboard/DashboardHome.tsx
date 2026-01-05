"use client";
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/auth/useAuth';
import { ProjectCardSkeleton, ProjectCardSkeletonSmall } from './ProjectCardSkeleton';
import styles from './DashboardHome.module.css';

interface Project {
  id: number;
  name: string;
  description?: string;
  creator_user_id: number;
  status: 'in_progress' | 'completed' | 'cancelled';
  final_project_score?: number;
  created_at: string;
  updated_at: string;
  evaluations?: Evaluation[];
  creator?: {
    name: string;
  };
}

interface Evaluation {
  id: number;
  project_id: number;
  standard_id: number;
  creation_date: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

const getProjectIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return {
        icon: (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bg: 'linear-gradient(135deg, rgba(78, 94, 163, 0.1) 0%, rgba(89, 70, 154, 0.1) 100%)'
      };
    case 'in_progress':
      return {
        icon: (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4E5EA3" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ),
        bg: 'linear-gradient(135deg, rgba(78, 94, 163, 0.1) 0%, rgba(89, 70, 154, 0.1) 100%)'
      };
    case 'cancelled':
      return {
        icon: (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bg: 'linear-gradient(135deg, rgba(78, 94, 163, 0.1) 0%, rgba(89, 70, 154, 0.1) 100%)'
      };
    default:
      return {
        icon: (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4E5EA3" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        bg: 'linear-gradient(135deg, rgba(78, 94, 163, 0.1) 0%, rgba(89, 70, 154, 0.1) 100%)'
      };
  }
};

// Memoizar formatDate para evitar recrearlo en cada render
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export function DashboardHome() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true); // Iniciar en true para mostrar skeletons inmediatamente

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // Cargar todos los proyectos
        const response = await fetch('/api/config-evaluation/projects');
        if (response.ok) {
          const data = await response.json();
          if (mounted && Array.isArray(data)) {
            // Filtrar: solo proyectos del usuario logueado y en estado "in_progress"
            const filteredProjects = data.filter(
              (project) =>
                project.creator_user_id === user?.id &&
                project.status === 'in_progress'
            );
            // Ordenar por fecha de actualización
            const sortedProjects = filteredProjects.toSorted((a, b) =>
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            );
            setProjects(sortedProjects);
          }
        }
      } catch {
        if (mounted) {
          setProjects([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load().catch(err => console.error('Failed to load dashboard data:', err));
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Memoizar proyectos recientes y todos los proyectos
  const recentProjects = useMemo(() => projects.slice(0, 3), [projects]);
  const allProjects = useMemo(() => projects, [projects]);

  return (
    <div className={styles.root}>
      {/* Welcome Section */}
      <header className={styles.greeting}>
        <h1>Hola, {user?.name ?? 'Usuario'}</h1>
        <Link href="/configuration-evaluation" className={styles.newEvaluationBtn}>
          + Nueva Evaluación
        </Link>
      </header>

      {/* Proyectos Recientes - TARJETAS GRANDES */}
      <div className={styles.dashedContainer}>
        <section className={styles.sectionWrapper}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Proyectos recientes</h3>
          </div>

          {loading && (
            <div className={styles.recentGridLarge}>
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </div>
          )}

          {!loading && (
            <div className={styles.recentGridLarge}>
              {recentProjects.length === 0 && <p className={styles.emptyText}>No tienes proyectos recientes.</p>}

              {recentProjects.map((project) => {
                const latestEvaluation = project.evaluations?.[0];
                const { icon, bg } = getProjectIcon(latestEvaluation?.status || '');

                return (
                  <article key={project.id} className={styles.recentCardLarge}>
                    <div className={styles.cardIcon} style={{ background: bg }}>
                      <div className={styles.cardIconEmoji}>{icon}</div>
                    </div>
                    <div className={styles.cardContent}>
                      <h4 className={styles.cardTitle}>{project.name}</h4>
                      <p className={styles.cardDesc}>{project.description || 'Sin descripción'}</p>
                      <div className={styles.cardFooter}>
                        <time className={styles.cardDate}>
                          Actualizado: {formatDate(project.updated_at)}
                        </time>
                        <Link href={`/data-entry/${project.id}`} className={styles.viewBtn}>
                          Abrir
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Todos los Proyectos - TARJETAS PEQUEÑAS */}
      <section className={styles.sectionWrapper}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Todos los proyectos</h3>
        </div>

        {loading && (
          <div className={styles.allGridSmall}>
            <ProjectCardSkeletonSmall />
            <ProjectCardSkeletonSmall />
            <ProjectCardSkeletonSmall />
            <ProjectCardSkeletonSmall />
            <ProjectCardSkeletonSmall />
            <ProjectCardSkeletonSmall />
          </div>
        )}

        {!loading && (
          <div className={styles.allGridSmall}>
            {allProjects.length === 0 && <p className={styles.emptyText}>No hay proyectos disponibles.</p>}

            {allProjects.map((project) => {
              const latestEvaluation = project.evaluations?.[0];
              const { icon, bg } = getProjectIcon(latestEvaluation?.status || '');

              return (
                <article key={project.id} className={styles.allCardSmall}>
                  <div className={styles.smallCardIcon} style={{ background: bg }}>
                    <div className={styles.smallCardIconEmoji}>{icon}</div>
                  </div>
                  <div className={styles.smallCardContent}>
                    <h4 className={styles.smallCardTitle}>{project.name}</h4>
                    <p className={styles.smallCardDesc}>
                      {project.description || 'Sin descripción'}
                    </p>
                  </div>
                  <div className={styles.smallCardFooter}>
                    <Link href={`/data-entry/${project.id}`} className={styles.smallViewBtn}>
                      Abrir
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}