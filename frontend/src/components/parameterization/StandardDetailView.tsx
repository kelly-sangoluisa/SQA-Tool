import React, { useState, useEffect } from 'react';
import { Standard, Criterion, SubCriterion, Metric, parameterizationApi } from '../../api/parameterization/parameterization-api';
import { Breadcrumbs, BreadcrumbItem } from '../shared/Breadcrumbs';

import styles from './StandardDetailView.module.css';
import { CriteriaNavigation } from './CriteriaNavigation';
import { MetricsView } from './MetricsView';
import { MetricFormDrawer } from './MetricFormDrawer';

interface StandardDetailViewProps {
  standard: Standard;
  onBack: () => void;
}

export function StandardDetailView({ standard, onBack }: StandardDetailViewProps) {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [selectedCriterion, setSelectedCriterion] = useState<Criterion | null>(null);
  const [selectedSubCriterion, setSelectedSubCriterion] = useState<SubCriterion | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null);

  useEffect(() => {
    loadCriteria();
  }, [standard.id]);

  const loadCriteria = async () => {
    setLoading(true);
    try {
      // Load all criteria including inactive ones
      const data = await parameterizationApi.getCriteriaByStandard(standard.id, { state: 'all' });
      setCriteria(data);
    } catch (error) {
      console.error('Error loading criteria:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubCriteria = async (criterionId: number) => {
    try {
      const subCriteriaData = await parameterizationApi.getSubCriteriaByCriterion(criterionId, { state: 'all' });
      return subCriteriaData || [];
    } catch (error) {
      console.error('Error loading subcriteria:', error);
      return [];
    }
  };

  const loadMetrics = async (subCriterionId: number) => {
    setLoading(true);
    try {
      const data = await parameterizationApi.getMetricsBySubCriterion(subCriterionId, { state: 'all' });
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubCriterionSelect = (criterion: Criterion, subCriterion: SubCriterion) => {
    setSelectedCriterion(criterion);
    setSelectedSubCriterion(subCriterion);
    loadMetrics(subCriterion.id);
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

  const handleRefreshMetrics = () => {
    if (selectedSubCriterion) {
      loadMetrics(selectedSubCriterion.id);
    }
  };

  const handleCriterionEdit = (criterion: Criterion) => {
    console.log('Editando criterio:', criterion.name);
  };

  const handleCriterionCreate = () => {
    console.log('Creando nuevo criterio');
  };

  const handleSubCriterionEdit = (criterion: Criterion, subCriterion: SubCriterion) => {
    console.log('Editando subcriterio:', subCriterion.name, 'del criterio:', criterion.name);
  };

  const handleSubCriterionCreate = (criterion: Criterion) => {
    console.log('Creando nuevo subcriterio para criterio:', criterion.name);
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Parámetros', onClick: onBack },
    { label: standard.name, isActive: !selectedCriterion },
    ...(selectedCriterion ? [{ label: selectedCriterion.name, isActive: !selectedSubCriterion }] : []),
    ...(selectedSubCriterion ? [{ label: selectedSubCriterion.name, isActive: true }] : [])
  ];

  return (
    <div className={styles.container}>
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className={styles.header}>
        <h1 className={styles.title}>{standard.name}</h1>
        <p className={styles.description}>{standard.description}</p>
      </div>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <CriteriaNavigation
            standardId={standard.id}
            onSubCriterionSelect={handleSubCriterionSelect}
            onCriterionEdit={handleCriterionEdit}
            onCriterionCreate={handleCriterionCreate}
            onSubCriterionEdit={handleSubCriterionEdit}
            onSubCriterionCreate={handleSubCriterionCreate}
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
              onRefreshMetrics={handleRefreshMetrics}
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