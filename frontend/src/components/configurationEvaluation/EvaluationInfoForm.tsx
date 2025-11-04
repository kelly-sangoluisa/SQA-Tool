'use client';

import { useState } from 'react';
import { EvaluationInfo, ValidationErrors } from '@/types/configurationEvaluation.types';
import { Input, Button } from '../shared';
import styles from './EvaluationInfoForm.module.css';

interface EvaluationInfoFormProps {
  initialData?: EvaluationInfo;
  onNext: (data: EvaluationInfo) => void;
  onCancel?: () => void;
}

export function EvaluationInfoForm({ initialData, onNext, onCancel }: EvaluationInfoFormProps) {
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

  const handleChange = (field: keyof EvaluationInfo, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext(formData);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Información de la Evaluación</h2>
        <p className={styles.subtitle}>
          Ingrese los datos básicos para identificar esta evaluación de calidad
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
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
