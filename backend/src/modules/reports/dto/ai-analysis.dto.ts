export interface AIAnalysisRequest {
  projectId: number;
}

export interface AIRecommendation {
  prioridad: 'Alta' | 'Media' | 'Baja';
  titulo: string;
  descripcion: string;
  impacto: string;
  categoria?: string;
}

export interface AIAnalysisResponse {
  projectId: number;
  projectName: string;
  analisis_general: string;
  fortalezas: string[];
  debilidades: string[];
  recomendaciones: AIRecommendation[];
  riesgos: string[];
  proximos_pasos: string[];
  generatedAt: Date;
  metadata?: {
    score: number;
    threshold: number;
    meetsThreshold: boolean;
    totalEvaluations: number;
  };
}
