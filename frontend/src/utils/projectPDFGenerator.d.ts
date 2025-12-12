import type { ProjectReport, ProjectStats } from '@/api/reports/reports.types';

interface ProjectPDFOptions {
  report: ProjectReport;
  stats: ProjectStats;
  includeCertificate?: boolean;
}

export function generateProjectPDF(options: ProjectPDFOptions): Promise<void>;
