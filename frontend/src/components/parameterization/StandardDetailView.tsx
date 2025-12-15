'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Standard, Criterion, SubCriterion, Metric, parameterizationApi } from '../../api/parameterization/parameterization-api';
import { Breadcrumbs, BreadcrumbItem } from '../shared/Breadcrumbs';

import styles from './StandardDetailView.module.css';
import { CriteriaNavigation } from './CriteriaNavigation';
import { MetricsView } from './MetricsView';
import { MetricFormDrawer } from './MetricFormDrawer';

interface StandardDetailViewProps {
  readonly standard: Standard;
  readonly onBack: () => void;
}

export function StandardDetailView({ standard, onBack }: StandardDetailViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [selectedCriterion, setSelectedCriterion] = useState<Criterion | null>(null);
  const [selectedSubCriterion, setSelectedSubCriterion] = useState<SubCriterion | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null);

  const loadCriteria = async () => {
    setLoading(true);
    try {
      // Load all criteria including inactive ones
      const data = await parameterizationApi.getCriteriaByStandard(standard.id, { state: 'all' });
      setCriteria(data);
    } catch {
      // Error loading criteria - silently fail
      setCriteria([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // loadSubCriteria is defined but not used in current implementation
  // Keeping for potential future use
  // const loadSubCriteria = async (criterionId: number) => {
  //   try {
  //     const subCriteriaData = await parameterizationApi.getSubCriteriaByCriterion(criterionId, { state: 'all' });
  //     return subCriteriaData || [];
  //   } catch (error) {
  //     return [];
  //   }
  // };

  useEffect(() => {
    loadCriteria().catch(() => {
      // Error already handled in loadCriteria
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standard.id]);

  const loadMetrics = async (subCriterionId: number) => {
    setLoading(true);
    try {
      const data = await parameterizationApi.getMetricsBySubCriterion(subCriterionId, { state: 'all' });
      setMetrics(data);
    } catch {
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCriterionStateChange = (updatedCriterion: Criterion) => {
    // Si el criterio actualizado es el padre del subcriterio seleccionado
    if (selectedSubCriterion && selectedSubCriterion.criterion_id === updatedCriterion.id) {
      // Si el criterio se pone inactivo, poner el subcriterio y todas las métricas como inactivas
      if (updatedCriterion.state === 'inactive') {
        setSelectedSubCriterion(prev => prev ? { ...prev, state: 'inactive' } : null);
        setMetrics(prevMetrics => 
          prevMetrics.map(metric => ({ ...metric, state: 'inactive' as const }))
        );
      } else if (updatedCriterion.state === 'active' && selectedSubCriterion) {
        // Si el criterio se activa, recargar subcriterio y métricas para obtener estados reales
        loadMetrics(selectedSubCriterion.id);
      }
    }
  };

  const handleSubCriterionStateChange = (updatedSubCriterion: SubCriterion) => {
    // Si el subcriterio actualizado es el que está seleccionado, actualizar el estado
    if (selectedSubCriterion && selectedSubCriterion.id === updatedSubCriterion.id) {
      setSelectedSubCriterion(updatedSubCriterion);
      
      // Si el subcriterio se pone inactivo, poner todas las métricas como inactivas visualmente
      if (updatedSubCriterion.state === 'inactive') {
        setMetrics(prevMetrics => 
          prevMetrics.map(metric => ({ ...metric, state: 'inactive' as const }))
        );
      } else if (updatedSubCriterion.state === 'active') {
        // Si el subcriterio se activa, recargar las métricas para obtener sus estados reales
        loadMetrics(updatedSubCriterion.id);
      }
    }
  };

  const handleSubCriterionSelect = (criterion: Criterion, subCriterion: SubCriterion) => {
    // Actualizar el estado local inmediatamente
    setSelectedCriterion(criterion);
    setSelectedSubCriterion(subCriterion);
    loadMetrics(subCriterion.id);
    
    // Actualizar la URL sin esperar
    const params = new URLSearchParams(searchParams.toString());
    params.set('criterion', criterion.id.toString());
    params.set('subcriterion', subCriterion.id.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleEditMetric = (metric: Metric) => {
    setEditingMetric(metric);
    setIsDrawerOpen(true);
  };

  const handleCreateMetric = () => {
    setEditingMetric(null);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingMetric(null);
  };

  const handleMetricSaved = () => {
    if (selectedSubCriterion) {
      loadMetrics(selectedSubCriterion.id);
    }
    handleCloseDrawer();
  };

  const handleMetricStateChange = (updatedMetric: Metric) => {
    // Verificar si el subcriterio está activo antes de permitir activar métricas
    if (selectedSubCriterion?.state === 'inactive' && updatedMetric.state === 'active') {
      console.warn('No se puede activar una métrica cuando el subcriterio está inactivo');
      return; // No permitir la activación
    }
    
    // Actualizar la métrica en el estado local
    setMetrics(prevMetrics => 
      prevMetrics.map(metric => 
        metric.id === updatedMetric.id ? updatedMetric : metric
      )
    );
  };

  const handleCriterionEdit = (_criterion: Criterion) => {
    // Edit criterion - TODO: implement
  };

  const handleCriterionCreate = () => {
    // Create new criterion - TODO: implement
  };

  const handleSubCriterionEdit = (criterion: Criterion, subCriterion: SubCriterion) => {
    // Edit subcriterion
  };

  const handleSubCriterionCreate = (_criterion: Criterion) => {
    // Create new subcriterion - TODO: implement
  };

  const handleBreadcrumbToStandard = () => {
    // Limpiar la selección primero
    setSelectedCriterion(null);
    setSelectedSubCriterion(null);
    setMetrics([]);
    
    // Volver al estándar sin criterio ni subcriterio
    const params = new URLSearchParams(searchParams.toString());
    params.delete('criterion');
    params.delete('subcriterion');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleBreadcrumbToCriterion = () => {
    // Limpiar el subcriterio primero
    setSelectedSubCriterion(null);
    setMetrics([]);
    
    // Volver al criterio (quitar solo el subcriterio)
    const params = new URLSearchParams(searchParams.toString());
    params.delete('subcriterion');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Parámetros', onClick: onBack },
    { 
      label: standard.name, 
      isActive: !selectedCriterion,
      onClick: selectedCriterion ? handleBreadcrumbToStandard : undefined
    },
    ...(selectedCriterion ? [{ 
      label: selectedCriterion.name, 
      isActive: !selectedSubCriterion,
      onClick: selectedSubCriterion ? handleBreadcrumbToCriterion : undefined
    }] : []),
    ...(selectedSubCriterion ? [{ label: selectedSubCriterion.name, isActive: true }] : [])
  ];

  return (
    <div className={styles.container}>
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className={styles.header}>
        <h1 className={styles.title}>{standard.name}</h1>
        <p className={styles.description}>{standard.description}</p>
      </div>

      {initialLoading ? (
        <div className={styles.content}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Cargando criterios...</p>
          </div>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.sidebar}>
            <CriteriaNavigation
              standardId={standard.id}
              onSubCriterionSelect={handleSubCriterionSelect}
              onCriterionEdit={handleCriterionEdit}
              onCriterionCreate={handleCriterionCreate}
              onSubCriterionEdit={handleSubCriterionEdit}
              onSubCriterionCreate={handleSubCriterionCreate}
              onSubCriterionStateChange={handleSubCriterionStateChange}
              onCriterionStateChange={handleCriterionStateChange}
              onRefresh={loadCriteria}
            />
          </div>

          <div className={styles.mainContent}>
            {selectedSubCriterion ? (
              <MetricsView
                subCriterion={selectedSubCriterion}
                metrics={metrics}
                loading={loading}
                onEditMetric={handleEditMetric}
                onCreateMetric={handleCreateMetric}
                onMetricStateChange={handleMetricStateChange}
              />
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📊</div>
                <h3>Selecciona un Sub-criterio</h3>
                <p>Elige un sub-criterio del panel izquierdo para ver y gestionar sus métricas.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {isDrawerOpen && (
        <MetricFormDrawer
          metric={editingMetric}
          subCriterionId={selectedSubCriterion?.id}
          onClose={handleCloseDrawer}
          onSave={handleMetricSaved}
        />
      )}
    </div>
  );
}