export interface Project {
  project_id: number;
  project_name: string;
  status: string;
  updated_at: string;
  final_project_score: number | null;
  meets_threshold: boolean;
}

export interface Evaluation {
  evaluation_id: number;
  project_id: number;
  project_name: string;
  standard_name: string;
  created_at: string;
  updated_at?: string;
  final_score: number | null;
  has_results: boolean;
}

export interface SidebarState {
  isOpen: boolean;
}
