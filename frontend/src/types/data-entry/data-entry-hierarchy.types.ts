/**
 * Types specific for DataEntryHierarchy component
 * These interfaces extend MultiLevelHierarchy base types
 */

import type { BaseGroup, BaseLevel2Item, BaseLevel3Item, BaseLevel4Item } from '@/components/shared/hierarchy/MultiLevelHierarchy';
import type { Variable } from './data-entry.types';

export interface EvaluationGroup extends BaseGroup {
  id: number;
  name: string;
  version: string;
  standard_id: number;
  project_id: number;
  status: 'in_progress' | 'completed' | 'cancelled';
}

export interface EvaluationCriterion extends BaseLevel2Item {
  id: number;
  name: string;
  description?: string;
  importance_level: string;
  importance_percentage: number;
}

export interface EvaluationSubcriterion extends BaseLevel3Item {
  id: number;
  name: string;
  description?: string;
  parent_id: number;
  state: string;
}

export interface EvaluationMetric extends BaseLevel4Item {
  id: number;
  name: string;
  description?: string;
  parent_id: number;
  formula: string;
  variables?: Variable[];
}
