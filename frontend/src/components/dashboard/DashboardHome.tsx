"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/auth/useAuth';
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
      return { icon: '✅', bg: '#e0f2fe' };
    case 'in_progress':
      return { icon: '🔄', bg: '#ecfdf5' };
    case 'cancelled':
      return { icon: '❌', bg: '#fee2e2' };
    default:
      return { icon: '📋', bg: '#f3f4f6' };
  }
};

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
  const [loading, setLoading] = useState(false);

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
            // Ordenar los proyectos por fecha de actualización
            const sortedProjects = data.sort((a, b) => 
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
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Separar proyectos recientes (últimos 3) y todos los proyectos
  const recentProjects = projects.slice(0, 3);
  const allProjects = projects;

  return (
    <div className={styles.root}>
      {/* Welcome Section */}
      <header className={styles.greeting}>
        <h2>Hola, {user?.name ?? 'Usuario'}</h2>
        <a href="/configuration-evaluation" className={styles.newEvaluationBtn}>
          + Nueva Evaluación
        </a>
      </header>

      {/* Proyectos Recientes - TARJETAS GRANDES */}
      <div className={styles.dashedContainer}>
        <section className={styles.sectionWrapper}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Proyectos recientes</h3>
            <a href="/configuration-evaluation/projects" className={styles.viewAllLink}>Ver todos</a>
          </div>

          {loading && <p className={styles.loadingText}>Cargando...</p>}

          {!loading && (
            <div className={styles.recentGridLarge}>
              {recentProjects.length === 0 && <p className={styles.emptyText}>No tienes proyectos recientes.</p>}

              {recentProjects.map((project) => {
                const latestEvaluation = project.evaluations?.[0];
                const { icon, bg } = getProjectIcon(latestEvaluation?.status || '');
                
                return (
                  <article key={project.id} className={styles.recentCardLarge}>
                    <div className={styles.cardIcon} style={{ background: bg }}>
                      <span className={styles.cardIconEmoji}>{icon}</span>
                    </div>
                    <div className={styles.cardContent}>
                      <h4 className={styles.cardTitle}>{project.name}</h4>
                      <p className={styles.cardDesc}>{project.description || 'Sin descripción'}</p>
                      <div className={styles.cardFooter}>
                        <time className={styles.cardDate}>
                          Actualizado: {formatDate(project.updated_at)}
                        </time>
                        <a href={`/data-entry/${project.id}`} className={styles.viewBtn}>
                          Abrir
                        </a>
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

        {!loading && (
          <div className={styles.allGridSmall}>
            {allProjects.length === 0 && <p className={styles.emptyText}>No hay proyectos disponibles.</p>}

            {allProjects.map((project) => {
              const latestEvaluation = project.evaluations?.[0];
              const { icon, bg } = getProjectIcon(latestEvaluation?.status || '');

              return (
                <article key={project.id} className={styles.allCardSmall}>
                  <div className={styles.smallCardIcon} style={{ background: bg }}>
                    <span className={styles.smallCardIconEmoji}>{icon}</span>
                  </div>
                  <div className={styles.smallCardContent}>
                    <h4 className={styles.smallCardTitle}>{project.name}</h4>
                    <p className={styles.smallCardDesc}>
                      {project.description || 'Sin descripción'}
                    </p>
                  </div>
                  <div className={styles.smallCardFooter}>
                    <a href={`/data-entry/${project.id}`} className={styles.smallViewBtn}>
                      Abrir
                    </a>
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