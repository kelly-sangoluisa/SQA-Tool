"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/auth/useAuth';
import styles from './DashboardHome.module.css';

type Evaluation = {
  id: string;
  title: string;
  description?: string;
  date?: string;
  icon?: string;
  iconBg?: string;
};

export function DashboardHome() {
  const { user } = useAuth();

  const [recentEvaluations, setRecentEvaluations] = useState<Evaluation[] | null>(null);
  const [allEvaluations, setAllEvaluations] = useState<Evaluation[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch evaluaciones desde la API
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // Intenta cargar desde la API
        const [recentRes, allRes] = await Promise.all([
          fetch('/api/evaluations/recent'),
          fetch('/api/evaluations/all')
        ]);

        if (!mounted) return;

        // Si la API responde, usa los datos
        if (recentRes.ok) {
          const recentData = await recentRes.json();
          setRecentEvaluations(Array.isArray(recentData) ? recentData : []);
        } else {
          // Fallback: datos de ejemplo para recientes
          setRecentEvaluations([
            { id: '1', title: 'Evaluación App A', description: 'Chequeo rápido de calidad', date: '2025-10-20', icon: '✅', iconBg: '#e0f2fe' },
            { id: '2', title: 'Proyecto B - Sprint 3', description: 'Análisis de defectos y métricas', date: '2025-10-18', icon: '📊', iconBg: '#ecfdf5' },
            { id: '3', title: 'Integración CI', description: 'Pruebas y cobertura', date: '2025-09-30', icon: '🔧', iconBg: '#f5f3ff' },
          ]);
        }

        if (allRes.ok) {
          const allData = await allRes.json();
          setAllEvaluations(Array.isArray(allData) ? allData : []);
        } else {
          // Fallback: datos de ejemplo para todas
          setAllEvaluations([
            { id: '4', title: 'API REST v2', description: 'Testing de endpoints', date: '2025-09-25', icon: '🔌', iconBg: '#fffbeb' },
            { id: '5', title: 'Dashboard Admin', description: 'QA completo', date: '2025-09-20', icon: '🎨', iconBg: '#fef2f2' },
            { id: '6', title: 'Auth Module', description: 'Seguridad y validación', date: '2025-09-15', icon: '🔐', iconBg: '#f0fdf4' },
            { id: '7', title: 'Payment Gateway', description: 'Integración de pagos', date: '2025-09-10', icon: '💳', iconBg: '#eff6ff' },
            { id: '8', title: 'Mobile App', description: 'Testing multiplataforma', date: '2025-09-05', icon: '📱', iconBg: '#fef3c7' },
            { id: '9', title: 'Database Migration', description: 'Migración de datos', date: '2025-08-30', icon: '💾', iconBg: '#ddd6fe' },
          ]);
        }
      } catch (e) {
        if (!mounted) return;
        // Fallback en caso de error
        setRecentEvaluations([
          { id: '1', title: 'Evaluación App A', description: 'Chequeo rápido de calidad', date: '2025-10-20', icon: '✅', iconBg: '#e0f2fe' },
          { id: '2', title: 'Proyecto B - Sprint 3', description: 'Análisis de defectos y métricas', date: '2025-10-18', icon: '📊', iconBg: '#ecfdf5' },
        ]);
        setAllEvaluations([
          { id: '4', title: 'API REST v2', description: 'Testing de endpoints', date: '2025-09-25', icon: '🔌', iconBg: '#fffbeb' },
          { id: '5', title: 'Dashboard Admin', description: 'QA completo', date: '2025-09-20', icon: '🎨', iconBg: '#fef2f2' },
        ]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={styles.root}>
      {/* Welcome Section */}
      <header className={styles.greeting}>
        <h2>Hola, {user?.name ?? 'Usuario'}</h2>
      </header>

      {/* Evaluaciones Recientes - TARJETAS GRANDES */}
      <div className={styles.dashedContainer}>
        <section className={styles.sectionWrapper}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Evaluaciones recientes</h3>
            <a href="/evaluations" className={styles.viewAllLink}>Ver todas</a>
          </div>

          {loading && <p className={styles.loadingText}>Cargando...</p>}

          {!loading && (
            <div className={styles.recentGridLarge}>
              {(recentEvaluations ?? []).length === 0 && <p className={styles.emptyText}>No tienes evaluaciones recientes.</p>}

              {(recentEvaluations ?? []).map((ev) => (
                <article key={ev.id} className={styles.recentCardLarge}>
                  <div className={styles.cardIcon} style={{ background: ev.iconBg || '#e0f2fe' }}>
                    <span className={styles.cardIconEmoji}>{ev.icon || '📋'}</span>
                  </div>
                  <div className={styles.cardContent}>
                    <h4 className={styles.cardTitle}>{ev.title}</h4>
                    <p className={styles.cardDesc}>{ev.description}</p>
                    <div className={styles.cardFooter}>
                      <time className={styles.cardDate}>{ev.date}</time>
                      <a href={`/evaluations/${ev.id}`} className={styles.viewBtn}>Abrir</a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Todas las Evaluaciones - TARJETAS PEQUEÑAS */}
      <section className={styles.sectionWrapper}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Todas las evaluaciones</h3>
        </div>

        {!loading && (
          <div className={styles.allGridSmall}>
            {(allEvaluations ?? []).length === 0 && <p className={styles.emptyText}>No hay evaluaciones disponibles.</p>}

            {(allEvaluations ?? []).map((ev) => (
              <article key={ev.id} className={styles.allCardSmall}>
                <div className={styles.smallCardIcon} style={{ background: ev.iconBg || '#f3f4f6' }}>
                  <span className={styles.smallCardIconEmoji}>{ev.icon || '📄'}</span>
                </div>
                <div className={styles.smallCardContent}>
                  <h4 className={styles.smallCardTitle}>{ev.title}</h4>
                  <p className={styles.smallCardDesc}>{ev.description}</p>
                </div>
                <div className={styles.smallCardFooter}>
                  <a href={`/evaluations/${ev.id}`} className={styles.smallViewBtn}>Abrir</a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}