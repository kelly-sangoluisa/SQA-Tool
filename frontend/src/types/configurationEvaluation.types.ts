// Configuration Evaluation Types

/**
 * Evaluation basic information (Step 1)
 */
export interface EvaluationInfo {
  name: string;
  version: string;
  company: string;
  minQualityThreshold: number;
}

/**
 * Selected criterion with its sub-criteria
 */
export interface SelectedCriterion {
  criterionId: number;
  criterionName: string;
  subCriteriaIds: number[];
  subCriteriaNames: string[];
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
  version?: string;
  company?: string;
  minQualityThreshold?: string;
}
