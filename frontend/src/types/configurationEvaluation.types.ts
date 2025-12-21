// Configuration Evaluation Types

/**
 * Evaluation basic information (Step 1)
 */
export interface EvaluationInfo {
  name: string;
  description?: string;
  version: string;
  company: string;
  minQualityThreshold: number;
}

/**
 * Importance level for criteria
 */
export type ImportanceLevel = 'A' | 'M' | 'B';

/**
 * Selected criterion with its sub-criteria and importance configuration
 */
export interface SelectedCriterion {
  criterionId: number;
  criterionName: string;
  subCriteriaIds: number[];
  subCriteriaNames: string[];
  importanceLevel: ImportanceLevel;
  importancePercentage: number;
}

/**
 * Complete evaluation configuration data
 */
export interface EvaluationConfiguration {
  info: EvaluationInfo;
  standardId: number;
  standardName: string;
  standardVersion: string;
  selectedCriteria: SelectedCriterion[];
}

/**
 * Stepper step definition
 */
export interface Step {
  number: number;
  title: string;
  description: string;
  isComplete: boolean;
  isActive: boolean;
}

/**
 * Form validation errors
 */
export interface ValidationErrors {
  name?: string;
  description?: string;
  version?: string;
  company?: string;
  minQualityThreshold?: string;
}

/**
 * Criterion importance configuration errors
 */
export interface CriterionImportanceErrors {
  importanceLevel?: string;
  importancePercentage?: string;
}
