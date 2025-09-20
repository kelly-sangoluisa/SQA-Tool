export interface DashboardProps {
  onNewEvaluation?: () => void;
  onActiveEvaluations?: () => void;
  onReports?: () => void;
}

export interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  variant: 'nueva-evaluacion' | 'evaluaciones-activas' | 'reportes';
}

export interface HeaderProps {
  title?: string;
  userRole?: string;
  userName?: string;
}