export interface DashboardProps {
  onNewEvaluation: () => void;
  onActiveEvaluations: () => void;
  onReports: () => void;
  onIngresoData: () => void;
  onLogout: () => void;
}


export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role?: {
    id: string;
    name: string;
  };
}

export interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant: 'nueva-evaluacion' | 'evaluaciones-activas' | 'reportes';
}

export interface HeaderProps {
  title?: string;
  userRole?: string;
  userName?: string;
}