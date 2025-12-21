/**
 * Types specific for Data Entry modal components
 */

// Variable representation for EvaluationCompleteModal
export interface ModalVariable {
  metric_name: string;
  variable_symbol: string;
  variable_value: string;
}

// Props interfaces for modals
export interface EvaluationCompleteModalProps {
  isOpen: boolean;
  evaluationName: string;
  isLastEvaluation: boolean;
  completedMetrics: number;
  totalMetrics: number;
  variables: ModalVariable[];
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface FinalizedEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface NextEvaluationModalProps {
  isOpen: boolean;
  currentEvaluationName: string;
  nextEvaluationName: string;
  onConfirm: () => void;
  onCancel: () => void;
}
