"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/auth/useAuth';
import { parameterizationApi, Standard, Criterion } from '../../api/parameterization/parameterization-api';
import styles from './AdminParameterization.module.css';

export function AdminParameterization() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'standards' | 'criteria' | 'subcriteria' | 'metrics'>('standards');
  const [standards, setStandards] = useState<Standard[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<number | null>(null);

  useEffect(() => {
    loadStandards();
  }, []);

  const loadStandards = async () => {
    setLoading(true);
    try {
      const data = await parameterizationApi.getStandards();
      setStandards(data);
    } catch (error) {
      console.error('Error loading standards:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCriteria = async (standardId: number) => {
    setLoading(true);
    try {
      const data = await parameterizationApi.getCriteriaByStandard(standardId);
      setCriteria(data);
    } catch (error) {
      console.error('Error loading criteria:', error);
      setCriteria([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStandardSelect = (standardId: number) => {
    setSelectedStandard(standardId);
    loadCriteria(standardId);
  };

  const renderStandards = () => (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeader}>
        <h3>Gestión de Estándares</h3>
        <button className={styles.addBtn}>+ Nuevo Estándar</button>
      </div>
      
      {loading ? (
        <div className={styles.loading}>Cargando estándares...</div>
      ) : (
        <div className={styles.grid}>
          {standards.map((standard) => (
            <div 
              key={standard.id} 
              className={`${styles.card} ${selectedStandard === standard.id ? styles.selected : ''}`}
              onClick={() => handleStandardSelect(standard.id)}
            >
              <div className={styles.cardHeader}>
                <h4>{standard.name}</h4>
                <span className={`${styles.status} ${styles[standard.state]}`}>
                  {standard.state}
                </span>
              </div>
              <p className={styles.cardDescription}>
                {standard.description || 'Sin descripción'}
              </p>
              <div className={styles.cardFooter}>
                <span className={styles.cardDate}>
                  Creado: {new Date(standard.created_at).toLocaleDateString()}
                </span>
                <div className={styles.cardActions}>
                  <button className={styles.editBtn}>Editar</button>
                  <button className={styles.toggleBtn}>
                    {standard.state === 'active' ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCriteria = () => (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeader}>
        <h3>Gestión de Criterios</h3>
        {selectedStandard && (
          <button className={styles.addBtn}>+ Nuevo Criterio</button>
        )}
      </div>

      {!selectedStandard ? (
        <div className={styles.emptyState}>
          <p>Selecciona un estándar desde la pestaña "Estándares" para ver sus criterios</p>
        </div>
      ) : loading ? (
        <div className={styles.loading}>Cargando criterios...</div>
      ) : (
        <div className={styles.grid}>
          {criteria.map((criterion) => (
            <div key={criterion.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h4>{criterion.name}</h4>
                <span className={`${styles.status} ${styles[criterion.state]}`}>
                  {criterion.state}
                </span>
              </div>
              <p className={styles.cardDescription}>
                {criterion.description || 'Sin descripción'}
              </p>
              <div className={styles.cardFooter}>
                <span className={styles.cardDate}>
                  Creado: {new Date(criterion.created_at).toLocaleDateString()}
                </span>
                <div className={styles.cardActions}>
                  <button className={styles.editBtn}>Editar</button>
                  <button className={styles.toggleBtn}>
                    {criterion.state === 'active' ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1>Panel de Administración - Parametrización</h1>
        <p>Gestiona estándares, criterios, subcriterios y métricas del sistema</p>
      </header>

      <nav className={styles.tabNav}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'standards' ? styles.active : ''}`}
          onClick={() => setActiveTab('standards')}
        >
          Estándares
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'criteria' ? styles.active : ''}`}
          onClick={() => setActiveTab('criteria')}
        >
          Criterios
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'subcriteria' ? styles.active : ''}`}
          onClick={() => setActiveTab('subcriteria')}
        >
          Subcriterios
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'metrics' ? styles.active : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          Métricas
        </button>
      </nav>

      <main className={styles.main}>
        {activeTab === 'standards' && renderStandards()}
        {activeTab === 'criteria' && renderCriteria()}
        {activeTab === 'subcriteria' && (
          <div className={styles.comingSoon}>
            <h3>Subcriterios</h3>
            <p>Funcionalidad en desarrollo...</p>
          </div>
        )}
        {activeTab === 'metrics' && (
          <div className={styles.comingSoon}>
            <h3>Métricas</h3>
            <p>Funcionalidad en desarrollo...</p>
          </div>
        )}
      </main>
    </div>
  );
}