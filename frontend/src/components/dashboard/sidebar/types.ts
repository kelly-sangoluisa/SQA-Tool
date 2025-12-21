// DTO que devuelve /reports/my-projects (CORRECTO - filtrado por usuario)
export interface DashboardProject {
  project_id: number;
  project_name: string;
  project_description: string | null;
  minimum_threshold: number | null;
  final_project_score: number | null;
  meets_threshold: boolean;
  status: string;
  evaluation_count: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardEvaluation {
  evaluation_id: number;
  project_id: number;
  project_name: string;
  standard_name: string;
  created_at: string;
  updated_at?: string;
  final_score: number | null;
  has_results: boolean;
  status: string;
}


export interface SidebarState {
  isOpen: boolean;
}
