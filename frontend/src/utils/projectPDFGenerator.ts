import jsPDF from 'jspdf';
import type { ProjectReport, ProjectStats } from '@/api/reports/reports.types';
import type { AIAnalysisResponse } from '@/api/reports/ai-analysis.types';

interface SelectedAISections {
  general: boolean;
  strengths: boolean;
  weaknesses: boolean;
  recommendations: boolean;
  risks: boolean;
  nextSteps: boolean;
}

interface ProjectPDFOptions {
  report: ProjectReport;
  stats: ProjectStats;
  includeCertificate?: boolean;
  aiAnalysis?: AIAnalysisResponse | null;
  selectedAISections?: SelectedAISections;
}

export async function generateProjectPDF(options: ProjectPDFOptions): Promise<void> {
  const generator = new ProjectPDFGenerator();
  await generator.generate(options);
}

class ProjectPDFGenerator {
  private pdf!: jsPDF;
  private currentY = 0;
  private readonly margin = 20;
  private readonly pageWidth = 210; // A4 width in mm
  private readonly pageHeight = 297; // A4 height in mm
  private readonly lineHeight = 7;

  async generate(options: ProjectPDFOptions): Promise<void> {
    const { report, stats, includeCertificate = false, aiAnalysis, selectedAISections } = options;

    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Página 1: Portada
    this.addCoverPage(report);

    // Página 2: Índice
    this.addNewPage();
    this.addTableOfContents(aiAnalysis, selectedAISections);

    // Página 3: Resumen Ejecutivo
    this.addNewPage();
    this.addExecutiveSummary(report, stats);

    // Página 4: Detalles de Evaluaciones
    this.addNewPage();
    this.addEvaluationsDetails(report);

    // Análisis de IA (si está disponible y hay secciones seleccionadas)
    if (aiAnalysis && selectedAISections) {
      const hasSelectedSections = Object.values(selectedAISections).some(selected => selected);
      if (hasSelectedSections) {
        this.addNewPage();
        this.addAIAnalysis(aiAnalysis, selectedAISections);
      }
    }

    // Certificado de Cumplimiento (solo si cumple umbral y está habilitado)
    const shouldIncludeCertificate = includeCertificate && report.meets_threshold;
    if (shouldIncludeCertificate) {
      this.addNewPage();
      this.addCertificate(report);
      
      // Agregar sello en la portada
      this.pdf.setPage(1);
      await this.addApprovalSeal();
    }

    // Pie de página en todas las páginas
    this.addPageNumbers(shouldIncludeCertificate);

    // Descargar
    const fileName = `Proyecto_${report.project_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    this.pdf.save(fileName);
  }

  private addCoverPage(report: ProjectReport): void {
    this.currentY = 60;

    // Título principal
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(28);
    this.pdf.setTextColor(78, 94, 163); // color-primary
    this.pdf.text('REPORTE DEL PROYECTO', this.pageWidth / 2, this.currentY, { align: 'center' });

    // Nombre del proyecto
    this.currentY += 20;
    this.pdf.setFontSize(22);
    this.pdf.text(report.project_name, this.pageWidth / 2, this.currentY, { align: 'center' });

    // Descripción si existe
    if (report.project_description) {
      this.currentY += 12;
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(11);
      this.pdf.setTextColor(100, 100, 100);
      const lines = this.pdf.splitTextToSize(report.project_description, this.pageWidth - 2 * this.margin);
      this.pdf.text(lines, this.pageWidth / 2, this.currentY, { align: 'center' });
      this.currentY += lines.length * 5;
    }

    // Fecha
    this.currentY += 15;
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(120, 120, 120);
    const date = new Date(report.created_at).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.pdf.text(date, this.pageWidth / 2, this.currentY, { align: 'center' });

    // Score con más separación
    this.currentY += 20;
    this.pdf.setFont('helvetica', 'bold');
    const scoreColor = report.final_project_score >= 80 ? [16, 185, 129] : 
                        report.final_project_score >= 60 ? [245, 158, 11] : [239, 68, 68];
    this.pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    this.pdf.setFontSize(32);
    this.pdf.text(`${report.final_project_score.toFixed(1)}%`, this.pageWidth / 2, this.currentY, { align: 'center' });

    // Línea decorativa debajo del score
    this.currentY += 8;
    this.pdf.setDrawColor(78, 94, 163);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.pageWidth / 2 - 40, this.currentY, this.pageWidth / 2 + 40, this.currentY);

    // Badge de estado del proyecto - centrado
    this.currentY += 15;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(12);
    const statusLabelWidth = this.pdf.getTextWidth('Estado del Proyecto:');
    this.pdf.text('Estado del Proyecto:', (this.pageWidth - statusLabelWidth) / 2, this.currentY);
    
    this.currentY += 8;
    const meetsThreshold = report.meets_threshold;
    const badgeColor = meetsThreshold ? [16, 185, 129] : [239, 68, 68];
    const statusText = meetsThreshold ? 'APROBADO' : 'NO APROBADO';
    const badgeWidth = meetsThreshold ? 45 : 55;
    const badgeHeight = 11;
    const badgeX = (this.pageWidth - badgeWidth) / 2;
    
    this.pdf.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    this.pdf.roundedRect(badgeX, this.currentY - 6, badgeWidth, badgeHeight, 2, 2, 'F');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(statusText, this.pageWidth / 2, this.currentY, { align: 'center' });

    this.currentY += 10;

    // Footer
    this.pdf.setTextColor(128, 128, 128);
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Generado automáticamente por SQA Tool', this.pageWidth / 2, this.pageHeight - 28, { align: 'center' });
    this.pdf.text(new Date().toLocaleDateString('es-ES'), this.pageWidth / 2, this.pageHeight - 20, { align: 'center' });
    this.pdf.text(new Date().toLocaleTimeString('es-ES'), this.pageWidth / 2, this.pageHeight - 14, { align: 'center' });
  }

  private async addApprovalSeal(): Promise<void> {
    try {
      const response = await fetch('/seal.png');
      const blob = await response.blob();
      const reader = new FileReader();
      
      await new Promise((resolve, reject) => {
        reader.onload = () => {
          const imgData = reader.result as string;
          const sealSize = 35;
          const x = this.pageWidth - sealSize - 15;
          const y = 15;
          this.pdf.addImage(imgData, 'PNG', x, y, sealSize, sealSize);
          resolve(null);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('No se pudo cargar el sello de aprobación:', error);
    }
  }

  private addTableOfContents(aiAnalysis?: AIAnalysisResponse | null, selectedAISections?: SelectedAISections): void {
    this.addSectionTitle('Índice');
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(60, 60, 60);

    const items = [
      '1. Resumen Ejecutivo',
      '2. Detalles de las Evaluaciones'
    ];

    // Agregar sección de IA si está disponible
    if (aiAnalysis && selectedAISections) {
      const hasSelectedSections = Object.values(selectedAISections).some(selected => selected);
      if (hasSelectedSections) {
        items.push('3. Análisis de Calidad con IA');
        items.push('4. Certificado de Cumplimiento (si aplica)');
      } else {
        items.push('3. Certificado de Cumplimiento (si aplica)');
      }
    } else {
      items.push('3. Certificado de Cumplimiento (si aplica)');
    }

    items.forEach(item => {
      this.pdf.text(item, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    });
  }

  private addExecutiveSummary(report: ProjectReport, stats: ProjectStats): void {
    this.addSectionTitle('1. Resumen Ejecutivo');

    // Información del proyecto
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(78, 94, 163);
    this.pdf.text('Información del Proyecto', this.margin, this.currentY);
    this.currentY += 10;

    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(0, 0, 0);

    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Proyecto:', this.margin, this.currentY);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(report.project_name, this.margin + 30, this.currentY);

    this.currentY += 8;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Creado por:', this.margin, this.currentY);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(report.created_by_name, this.margin + 30, this.currentY);

    this.currentY += 8;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Fecha:', this.margin, this.currentY);
    this.pdf.setFont('helvetica', 'normal');
    const date = new Date(report.created_at).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.pdf.text(date, this.margin + 30, this.currentY);

    this.currentY += 8;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Puntuación:', this.margin, this.currentY);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`${report.final_project_score.toFixed(1)}%`, this.margin + 30, this.currentY);

    this.currentY += 8;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Umbral:', this.margin, this.currentY);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`${report.minimum_threshold}%`, this.margin + 30, this.currentY);

    // Estadísticas
    this.currentY += 15;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(78, 94, 163);
    this.pdf.text('Estadísticas', this.margin, this.currentY);
    this.currentY += 10;

    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(0, 0, 0);

    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Total de Evaluaciones:', this.margin, this.currentY);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(stats.total_evaluations.toString(), this.margin + 50, this.currentY);

    this.currentY += 8;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Completadas:', this.margin, this.currentY);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(stats.completed_evaluations.toString(), this.margin + 50, this.currentY);

    this.currentY += 8;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Promedio:', this.margin, this.currentY);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`${stats.average_evaluation_score?.toFixed(1) || '0.0'}%`, this.margin + 50, this.currentY);

    if (stats.completed_evaluations > 1 && stats.highest_evaluation && stats.lowest_evaluation) {
      this.currentY += 10;
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Mejor Evaluación:', this.margin, this.currentY);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(`${stats.highest_evaluation.standard_name || 'N/A'} (${stats.highest_evaluation.score?.toFixed(1) || '0.0'}%)`, this.margin + 42, this.currentY);

      this.currentY += 10;
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Evaluación Menor:', this.margin, this.currentY);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(`${stats.lowest_evaluation.standard_name || 'N/A'} (${stats.lowest_evaluation.score?.toFixed(1) || '0.0'}%)`, this.margin + 42, this.currentY);
    }

    // Estado de cumplimiento
    this.currentY += 15;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(12);
    const cumplimientoWidth = this.pdf.getTextWidth('Estado de Cumplimiento:');
    this.pdf.text('Estado de Cumplimiento:', (this.pageWidth - cumplimientoWidth) / 2, this.currentY);
    this.currentY += 8;
    
    const meetsThresholdExec = report.meets_threshold;
    const statusColor = meetsThresholdExec ? [16, 185, 129] : [239, 68, 68];
    const statusWidth = meetsThresholdExec ? 45 : 55;
    const badgeHeight = 11;
    const badgeX = (this.pageWidth - statusWidth) / 2;
    this.pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    this.pdf.roundedRect(badgeX, this.currentY - 6, statusWidth, badgeHeight, 2, 2, 'F');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    const statusText = meetsThresholdExec ? 'APROBADO' : 'NO APROBADO';
    this.pdf.text(statusText, this.pageWidth / 2, this.currentY, { align: 'center' });

    this.currentY += 12;
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.setFontSize(9);
    const umbralText = `Umbral mínimo: ${report.minimum_threshold}% | Obtenido: ${report.final_project_score.toFixed(1)}%`;
    const umbralWidth = this.pdf.getTextWidth(umbralText);
    this.pdf.text(umbralText, (this.pageWidth - umbralWidth) / 2, this.currentY);
  }

  private addEvaluationsDetails(report: ProjectReport): void {
    this.addSectionTitle('2. Evaluaciones del Proyecto');

    this.pdf.setFontSize(10);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(`Total de evaluaciones: ${report.evaluations.length}`, this.margin, this.currentY);
    this.currentY += 10;

    report.evaluations.forEach((evaluation, index) => {
      if (this.currentY > this.pageHeight - 60) {
        this.addNewPage();
      }

      // Encabezado de evaluación
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(11);
      this.pdf.setTextColor(78, 94, 163);
      this.pdf.text(`${index + 1}. ${evaluation.standard_name}`, this.margin, this.currentY);
      this.currentY += 8;

      // Detalles
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(60, 60, 60);

      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Fecha:', this.margin + 5, this.currentY);
      this.pdf.setFont('helvetica', 'normal');
      const date = new Date(evaluation.created_at).toLocaleDateString('es-ES');
      this.pdf.text(date, this.margin + 20, this.currentY);

      this.currentY += 6;
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Puntuación:', this.margin + 5, this.currentY);
      this.pdf.setFont('helvetica', 'normal');
      const scoreColor = evaluation.final_score >= 80 ? [16, 185, 129] : 
                         evaluation.final_score >= 60 ? [245, 158, 11] : [239, 68, 68];
      this.pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      this.pdf.text(`${evaluation.final_score.toFixed(1)}%`, this.margin + 30, this.currentY);

      // Línea separadora
      this.currentY += 8;
      this.pdf.setDrawColor(220, 220, 220);
      this.pdf.setLineWidth(0.5);
      this.pdf.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
      this.currentY += 8;

      this.pdf.setTextColor(60, 60, 60);
    });
  }

  private addCertificate(report: ProjectReport): void {
    // Fondo decorativo
    this.pdf.setFillColor(248, 250, 252);
    this.pdf.rect(0, 0, this.pageWidth, this.pageHeight, 'F');

    // Borde decorativo
    this.pdf.setDrawColor(78, 94, 163);
    this.pdf.setLineWidth(2);
    this.pdf.rect(10, 10, this.pageWidth - 20, this.pageHeight - 20);
    
    this.pdf.setLineWidth(0.5);
    this.pdf.rect(12, 12, this.pageWidth - 24, this.pageHeight - 24);

    // Título del certificado
    this.currentY = 50;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(24);
    this.pdf.setTextColor(78, 94, 163);
    this.pdf.text('CERTIFICADO DE CUMPLIMIENTO', this.pageWidth / 2, this.currentY, { align: 'center' });

    // Línea decorativa
    this.currentY += 10;
    this.pdf.setDrawColor(78, 94, 163);
    this.pdf.setLineWidth(1);
    this.pdf.line(this.pageWidth / 2 - 50, this.currentY, this.pageWidth / 2 + 50, this.currentY);

    // Texto del certificado
    this.currentY += 20;
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(60, 60, 60);
    this.pdf.text('Se certifica que el proyecto:', this.pageWidth / 2, this.currentY, { align: 'center' });

    this.currentY += 15;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(78, 94, 163);
    this.pdf.text(report.project_name, this.pageWidth / 2, this.currentY, { align: 'center' });

    this.currentY += 15;
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(60, 60, 60);
    this.pdf.text('Ha cumplido satisfactoriamente con los estándares de calidad', this.pageWidth / 2, this.currentY, { align: 'center' });

    this.currentY += 8;
    this.pdf.text('establecidos en las evaluaciones realizadas.', this.pageWidth / 2, this.currentY, { align: 'center' });

    // Puntuación
    this.currentY += 20;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(14);
    this.pdf.text('Puntuación Obtenida:', this.pageWidth / 2, this.currentY, { align: 'center' });

    this.currentY += 12;
    this.pdf.setTextColor(16, 185, 129);
    this.pdf.setFontSize(36);
    this.pdf.text(`${report.final_project_score.toFixed(1)}%`, this.pageWidth / 2, this.currentY, { align: 'center' });

    this.currentY += 12;
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(60, 60, 60);
    this.pdf.text(`Umbral mínimo requerido: ${report.minimum_threshold}%`, this.pageWidth / 2, this.currentY, { align: 'center' });

    // Estado
    this.currentY += 20;
    this.pdf.setFillColor(16, 185, 129);
    this.pdf.roundedRect(this.pageWidth / 2 - 30, this.currentY - 8, 60, 15, 3, 3, 'F');
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.text('APROBADO', this.pageWidth / 2, this.currentY, { align: 'center' });

    // Fecha de emisión
    this.currentY = this.pageHeight - 40;
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(100, 100, 100);
    const today = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.pdf.text(`Emitido el ${today}`, this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 8;
    this.pdf.text('por SQA Tool - Sistema de Evaluación de Calidad de Software', this.pageWidth / 2, this.currentY, { align: 'center' });
  }

  private addAIAnalysis(analysis: AIAnalysisResponse, selectedSections: SelectedAISections): void {
    this.addSectionTitle('3. Análisis de Calidad con IA');

    this.pdf.setFont('helvetica', 'italic');
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(`Generado el ${new Date(analysis.generatedAt).toLocaleDateString('es-ES')}`, this.margin, this.currentY);
    this.currentY += 10;

    if (selectedSections.general && analysis.analisis_general) {
      this.addGeneralAnalysis(analysis.analisis_general);
    }

    if (selectedSections.strengths && analysis.fortalezas?.length) {
      this.addBulletList('Fortalezas Identificadas', analysis.fortalezas, 16, 185, 129);
    }

    if (selectedSections.weaknesses && analysis.debilidades?.length) {
      this.addBulletList('Áreas de Mejora', analysis.debilidades, 239, 68, 68);
    }

    if (selectedSections.recommendations && analysis.recomendaciones?.length) {
      this.addRecommendations(analysis.recomendaciones);
    }

    if (selectedSections.risks && analysis.riesgos?.length) {
      this.addBulletList('Riesgos Identificados', analysis.riesgos, 239, 68, 68);
    }

    if (selectedSections.nextSteps && analysis.proximos_pasos?.length) {
      this.addNextSteps(analysis.proximos_pasos);
    }
  }

  private addGeneralAnalysis(text: string): void {
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(78, 94, 163);
    this.pdf.text('Análisis General', this.margin, this.currentY);
    this.currentY += 8;

    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(0, 0, 0);
    const lines = this.pdf.splitTextToSize(text, this.pageWidth - 2 * this.margin);
    lines.forEach((line: string) => {
      if (this.currentY > this.pageHeight - 30) {
        this.addNewPage();
      }
      this.pdf.text(line, this.margin, this.currentY);
      this.currentY += 6;
    });
    this.currentY += 5;
  }

  private addBulletList(title: string, items: string[], r: number, g: number, b: number): void {
    if (this.currentY > this.pageHeight - 40) {
      this.addNewPage();
    }
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(r, g, b);
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 8;

    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(0, 0, 0);
    
    items.forEach((item) => {
      if (this.currentY > this.pageHeight - 30) {
        this.addNewPage();
      }
      const lines = this.pdf.splitTextToSize(`• ${item}`, this.pageWidth - 2 * this.margin - 5);
      lines.forEach((line: string) => {
        this.pdf.text(line, this.margin + 5, this.currentY);
        this.currentY += 6;
      });
    });
    this.currentY += 5;
  }

  private addRecommendations(recommendations: Array<{prioridad: 'Alta' | 'Media' | 'Baja'; titulo: string; descripcion: string; impacto: string}>): void {
    if (this.currentY > this.pageHeight - 40) {
      this.addNewPage();
    }
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(102, 126, 234);
    this.pdf.text('Recomendaciones Priorizadas', this.margin, this.currentY);
    this.currentY += 8;

    recommendations.forEach((rec) => {
      if (this.currentY > this.pageHeight - 50) {
        this.addNewPage();
      }

      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(10);
      const prioridadColor = rec.prioridad === 'Alta' ? [239, 68, 68] : 
                             rec.prioridad === 'Media' ? [251, 146, 60] : [34, 197, 94];
      this.pdf.setTextColor(prioridadColor[0], prioridadColor[1], prioridadColor[2]);
      this.pdf.text(`[${rec.prioridad}]`, this.margin + 5, this.currentY);
      
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text(rec.titulo, this.margin + 25, this.currentY);
      this.currentY += 6;

      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(9);
      const descLines = this.pdf.splitTextToSize(rec.descripcion, this.pageWidth - 2 * this.margin - 10);
      descLines.forEach((line: string) => {
        if (this.currentY > this.pageHeight - 30) {
          this.addNewPage();
        }
        this.pdf.text(line, this.margin + 10, this.currentY);
        this.currentY += 5;
      });

      this.pdf.setFont('helvetica', 'italic');
      const impactLines = this.pdf.splitTextToSize(`Impacto: ${rec.impacto}`, this.pageWidth - 2 * this.margin - 10);
      impactLines.forEach((line: string) => {
        if (this.currentY > this.pageHeight - 30) {
          this.addNewPage();
        }
        this.pdf.text(line, this.margin + 10, this.currentY);
        this.currentY += 5;
      });
      this.currentY += 3;
    });
    this.currentY += 5;
  }

  private addNextSteps(steps: string[]): void {
    if (this.currentY > this.pageHeight - 40) {
      this.addNewPage();
    }
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(102, 126, 234);
    this.pdf.text('Plan de Acción - Próximos Pasos', this.margin, this.currentY);
    this.currentY += 8;

    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(0, 0, 0);
    
    steps.forEach((paso, index) => {
      if (this.currentY > this.pageHeight - 30) {
        this.addNewPage();
      }
      const lines = this.pdf.splitTextToSize(`${index + 1}. ${paso}`, this.pageWidth - 2 * this.margin - 5);
      lines.forEach((line: string) => {
        this.pdf.text(line, this.margin + 5, this.currentY);
        this.currentY += 6;
      });
    });
  }

  private addSectionTitle(title: string): void {
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(78, 94, 163);
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 12;

    // Línea decorativa
    this.pdf.setDrawColor(78, 94, 163);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, this.currentY - 5, this.pageWidth - this.margin, this.currentY - 5);
  }

  private addNewPage(): void {
    this.pdf.addPage();
    this.currentY = this.margin + 10;
  }

  private addPageNumbers(includeCertificate: boolean = false): void {
    const pageCount = this.pdf.getNumberOfPages();
    const pagesWithNumbers = includeCertificate ? pageCount - 1 : pageCount;

    for (let i = 1; i <= pagesWithNumbers; i++) {
      this.pdf.setPage(i);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(150, 150, 150);
      this.pdf.text(
        `Página ${i} de ${pagesWithNumbers}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
    }
  }
}
