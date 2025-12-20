'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { EvaluationInfo, ValidationErrors } from '@/types/configurationEvaluation.types';
import { Input, Button } from '../shared';
import { configEvaluationApi, Project } from '@/api/config-evaluation/config-evaluation-api';
import styles from './EvaluationInfoForm.module.css';

interface EvaluationInfoFormProps {
  readonly initialData?: EvaluationInfo;
  readonly onNext: (data: EvaluationInfo, projectId?: number) => void;
  readonly onCancel?: () => void;
}

export function EvaluationInfoForm({ initialData, onNext, onCancel }: EvaluationInfoFormProps) {
  const { user } = useAuth(); // Hook para obtener el usuario logeado
  const [projectType, setProjectType] = useState<'new' | 'existing'>('new');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [formData, setFormData] = useState<EvaluationInfo>(
    initialData || {
      name: '',
      description: '',
      version: '',
      company: '',
      minQualityThreshold: 70,
    }
  );

  const [errors, setErrors] = useState<ValidationErrors>({});

  const loadProjects = useCallback(async () => {
    try {
      setLoadingProjects(true);
      const projectsList = await configEvaluationApi.getAllProjects();

      // Filtrar solo proyectos que:
      // 1. Están en progreso (no completados ni cancelados)
      // 2. Fueron creados por el usuario logeado
      const userProjects = projectsList.filter(project =>
        project.status === 'in_progress' &&
        user?.id &&
        project.creator_user_id === user.id
      );

      setProjects(userProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  }, [user]);

  // Load projects when user selects existing project
  useEffect(() => {
    if (projectType === 'existing') {
      loadProjects();
    }
  }, [projectType, loadProjects]);

  const handleChange = (field: keyof EvaluationInfo, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (projectType === 'existing') {
      // Para proyecto existente, solo validar que se haya seleccionado un proyecto
      if (!selectedProjectId) {
        newErrors.name = 'Debe seleccionar un proyecto';
      }
    } else {
      // Para proyecto nuevo, validar todos los campos
      if (!formData.name.trim()) {
        newErrors.name = 'El nombre de la evaluación es requerido';
      }

      if (!formData.version.trim()) {
        newErrors.version = 'La versión es requerida';
      }

      if (!formData.company.trim()) {
        newErrors.company = 'El nombre de la empresa es requerido';
      }

      if (formData.minQualityThreshold < 0 || formData.minQualityThreshold > 100) {
        newErrors.minQualityThreshold = 'El umbral debe estar entre 0 y 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (projectType === 'existing' && selectedProjectId !== null) {
        // Pasar el ID del proyecto existente
        onNext(formData, selectedProjectId);
      } else if (projectType === 'new') {
        // Crear proyecto nuevo
        onNext(formData);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Información de la Evaluación</h2>
        <p className={styles.subtitle}>
          Seleccione si desea crear un proyecto nuevo o evaluar uno existente
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Selector de tipo de proyecto */}
        <fieldset className={styles.projectTypeSelector}>
          <legend className={styles.label}>
            Tipo de Proyecto <span className={styles.required}>*</span>
          </legend>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="new"
                checked={projectType === 'new'}
                onChange={() => setProjectType('new')}
                className={styles.radioInput}
              />
              <span>Crear Proyecto Nuevo</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="existing"
                checked={projectType === 'existing'}
                onChange={() => setProjectType('existing')}
                className={styles.radioInput}
              />
              <span>Usar Proyecto Existente</span>
            </label>
          </div>
        </fieldset>

        {/* Mostrar selector de proyecto existente o formulario de proyecto nuevo */}
        {projectType === 'existing' ? (
          <div className={styles.formGroup}>
            <label htmlFor="project" className={styles.label}>
              Seleccionar Proyecto <span className={styles.required}>*</span>
            </label>
            {loadingProjects && (
              <p className={styles.loadingText}>Cargando proyectos...</p>
            )}
            {!loadingProjects && projects.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className={styles.emptyMessage}>
                  No tienes proyectos activos disponibles
                </p>
                <p className={styles.emptyHint}>
                  Crea un proyecto nuevo para comenzar tu evaluación
                </p>
                <button
                  type="button"
                  className={styles.createProjectButton}
                  onClick={() => setProjectType('new')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Proyecto Nuevo
                </button>
              </div>
            )}
            {!loadingProjects && projects.length > 0 && (
              <select
                id="project"
                className={styles.select}
                value={selectedProjectId || ''}
                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              >
                <option value="">-- Seleccione un proyecto --</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            )}
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>
        ) : (
          <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Nombre de la Evaluación <span className={styles.required}>*</span>
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Ej: Evaluación Q1 2025"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Descripción
            </label>
            <textarea
              id="description"
              className={styles.textarea}
              placeholder="Ej: Evaluación de calidad del proyecto de software..."
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
            {errors.description && <span className={styles.errorText}>{errors.description}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="version" className={styles.label}>
              Versión <span className={styles.required}>*</span>
            </label>
            <Input
              id="version"
              type="text"
              placeholder="Ej: 1.0.0"
              value={formData.version}
              onChange={(e) => handleChange('version', e.target.value)}
              error={errors.version}
            />
            {errors.version && <span className={styles.errorText}>{errors.version}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="company" className={styles.label}>
              Empresa <span className={styles.required}>*</span>
            </label>
            <Input
              id="company"
              type="text"
              placeholder="Ej: Acme Corporation"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              error={errors.company}
            />
            {errors.company && <span className={styles.errorText}>{errors.company}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="threshold" className={styles.label}>
              Umbral Mínimo de Calidad (%) <span className={styles.required}>*</span>
            </label>
            <Input
              id="threshold"
              type="number"
              min="0"
              max="100"
              placeholder="70"
              value={formData.minQualityThreshold.toString()}
              onChange={(e) => handleChange('minQualityThreshold', Number(e.target.value))}
              error={errors.minQualityThreshold}
            />
            {errors.minQualityThreshold && (
              <span className={styles.errorText}>{errors.minQualityThreshold}</span>
            )}
            <p className={styles.helpText}>
              Porcentaje mínimo requerido para considerar la evaluación como aprobada
            </p>
          </div>
        </div>
        )}

        <div className={styles.actions}>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" variant="primary">
            Continuar
          </Button>
        </div>
      </form>
    </div>
  );
}
