import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { EvaluationReport, EvaluationStats } from '@/api/reports/reports.types';

interface PDFGenerationOptions {
  report: EvaluationReport;
  stats: EvaluationStats;
}

export class PDFGenerator {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;
  private primaryColor = [78, 94, 163]; // #4E5EA3
  private secondaryColor = [89, 70, 154]; // #59469A

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
  }

  async generateReport(options: PDFGenerationOptions): Promise<void> {
    const { report, stats } = options;

    // Página 1: Portada
    this.addCoverPage(report);

    // Página 2: Índice
    this.addNewPage();
    this.addTableOfContents();

    // Página 3+: Resumen Ejecutivo
    this.addNewPage();
    this.addExecutiveSummary(report, stats);

    // Detalles de Criterios
    this.addNewPage();
    await this.addCriteriaDetails(report);

    // Gráficos
    this.addNewPage();
    await this.addCharts();

    // Conclusión
    this.addNewPage();
    this.addConclusion(report);

    // Pie de página en todas las páginas
    this.addPageNumbers();

    // Descargar
    const fileName = `Evaluacion_${report.project_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    this.pdf.save(fileName);
  }

  private addCoverPage(report: EvaluationReport): void {
    // Fondo degradado (simulado con rectángulos)
    this.pdf.setFillColor(78, 94, 163);
    this.pdf.rect(0, 0, this.pageWidth, 80, 'F');
    
    this.pdf.setFillColor(89, 70, 154);
    this.pdf.rect(0, 80, this.pageWidth, 40, 'F');

    // Título
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(32);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('INFORME DE EVALUACIÓN', this.pageWidth / 2, 50, { align: 'center' });

    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Calidad de Software', this.pageWidth / 2, 65, { align: 'center' });

    // Información del proyecto
    this.currentY = 140;
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Proyecto:', this.margin, this.currentY);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(report.project_name, this.margin + 30, this.currentY);

    this.currentY += 12;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Estándar:', this.margin, this.currentY);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(report.standard_name, this.margin + 30, this.currentY);

    this.currentY += 12;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Fecha:', this.margin, this.currentY);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(new Date(report.created_at).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }), this.margin + 30, this.currentY);

    this.currentY += 12;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Puntuación:', this.margin, this.currentY);
    this.pdf.setFont('helvetica', 'normal');
    const scoreColor = report.final_score >= 80 ? [16, 185, 129] : 
                        report.final_score >= 60 ? [245, 158, 11] : [239, 68, 68];
    this.pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    this.pdf.setFontSize(18);
    this.pdf.text(`${report.final_score.toFixed(1)}%`, this.margin + 30, this.currentY);

    // Footer
    this.pdf.setTextColor(128, 128, 128);
    this.pdf.setFontSize(10);
    this.pdf.text('Generado automáticamente por SQA Tool', this.pageWidth / 2, this.pageHeight - 15, { align: 'center' });
    this.pdf.text(new Date().toLocaleString('es-ES'), this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
  }

  private addTableOfContents(): void {
    this.pdf.setTextColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Índice', this.margin, this.currentY);

    this.currentY += 15;
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');

    const sections = [
      { title: '1. Resumen Ejecutivo', page: 3 },
      { title: '2. Detalles de Criterios', page: 4 },
      { title: '3. Análisis Gráfico', page: 5 },
      { title: '4. Conclusión', page: 6 }
    ];

    sections.forEach(section => {
      this.pdf.text(section.title, this.margin + 5, this.currentY);
      this.pdf.text(`Página ${section.page}`, this.pageWidth - this.margin - 20, this.currentY);
      this.currentY += 10;
    });
  }

  private addExecutiveSummary(report: EvaluationReport, stats: EvaluationStats): void {
    this.addSectionTitle('1. Resumen Ejecutivo');

    // Métricas clave en recuadros
    const boxY = this.currentY;
    const boxWidth = (this.pageWidth - 3 * this.margin) / 3;
    const boxHeight = 25;

    // Box 1: Criterios
    this.pdf.setFillColor(78, 94, 163);
    this.pdf.roundedRect(this.margin, boxY, boxWidth, boxHeight, 3, 3, 'F');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(stats.total_criteria.toString(), this.margin + boxWidth / 2, boxY + 12, { align: 'center' });
    this.pdf.setFontSize(10);
    this.pdf.text('Criterios', this.margin + boxWidth / 2, boxY + 20, { align: 'center' });

    // Box 2: Métricas
    this.pdf.setFillColor(89, 70, 154);
    this.pdf.roundedRect(this.margin + boxWidth + 5, boxY, boxWidth, boxHeight, 3, 3, 'F');
    this.pdf.setFontSize(24);
    this.pdf.text(stats.total_metrics.toString(), this.margin + boxWidth + 5 + boxWidth / 2, boxY + 12, { align: 'center' });
    this.pdf.setFontSize(10);
    this.pdf.text('Métricas', this.margin + boxWidth + 5 + boxWidth / 2, boxY + 20, { align: 'center' });

    // Box 3: Score Promedio
    const avgColor = stats.average_criteria_score >= 80 ? [16, 185, 129] : 
                      stats.average_criteria_score >= 60 ? [245, 158, 11] : [239, 68, 68];
    this.pdf.setFillColor(avgColor[0], avgColor[1], avgColor[2]);
    this.pdf.roundedRect(this.margin + 2 * (boxWidth + 5), boxY, boxWidth, boxHeight, 3, 3, 'F');
    this.pdf.setFontSize(24);
    this.pdf.text(`${stats.average_criteria_score.toFixed(1)}%`, this.margin + 2 * (boxWidth + 5) + boxWidth / 2, boxY + 12, { align: 'center' });
    this.pdf.setFontSize(10);
    this.pdf.text('Promedio', this.margin + 2 * (boxWidth + 5) + boxWidth / 2, boxY + 20, { align: 'center' });

    this.currentY = boxY + boxHeight + 15;

    // Mejor y peor criterio
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Mejor Criterio:', this.margin, this.currentY);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`${stats.best_criterion.name} (${stats.best_criterion.score.toFixed(1)}%)`, this.margin + 35, this.currentY);

    this.currentY += 10;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Criterio a Mejorar:', this.margin, this.currentY);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`${stats.worst_criterion.name} (${stats.worst_criterion.score.toFixed(1)}%)`, this.margin + 42, this.currentY);

    this.currentY += 15;
    
    // Estado de cumplimiento
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Estado de Cumplimiento:', this.margin, this.currentY);
    this.currentY += 8;
    
    const meetsThreshold = report.meets_threshold;
    const statusColor = meetsThreshold ? [16, 185, 129] : [239, 68, 68];
    this.pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    this.pdf.roundedRect(this.margin, this.currentY - 5, 60, 10, 2, 2, 'F');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(10);
    this.pdf.text(meetsThreshold ? '✓ APROBADO' : '✗ NO APROBADO', this.margin + 30, this.currentY, { align: 'center' });

    this.currentY += 12;
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.setFontSize(9);
    this.pdf.text(`Umbral mínimo: ${report.project_threshold}% | Obtenido: ${report.final_score.toFixed(1)}%`, this.margin, this.currentY);
  }

  private addCriteriaDetails(report: EvaluationReport): void {
    this.addSectionTitle('2. Detalles de Criterios');

    this.pdf.setFontSize(10);
    
    report.criteria_results.forEach((criterion, index) => {
      if (this.currentY > this.pageHeight - 50) {
        this.addNewPage();
      }

      // Nombre del criterio
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
      this.pdf.text(`${index + 1}. ${criterion.criterion_name}`, this.margin, this.currentY);
      
      // Score del criterio
      const scoreColor = criterion.final_score >= 80 ? [16, 185, 129] : 
                          criterion.final_score >= 60 ? [245, 158, 11] : [239, 68, 68];
      this.pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      this.pdf.text(`${criterion.final_score.toFixed(1)}%`, this.pageWidth - this.margin - 20, this.currentY);

      this.currentY += 7;
      
      // Importancia
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(9);
      const importanceLabel = criterion.importance_level === 'A' ? 'Alta' : 
                               criterion.importance_level === 'M' ? 'Media' : 
                               criterion.importance_level === 'B' ? 'Baja' : 'N/A';
      this.pdf.text(`Importancia: ${importanceLabel} (${criterion.importance_percentage}%)`, this.margin + 5, this.currentY);

      this.currentY += 6;
      
      // Descripción
      const description = criterion.criterion_description || 'Sin descripción';
      const splitDesc = this.pdf.splitTextToSize(description, this.pageWidth - 2 * this.margin - 10);
      this.pdf.setFontSize(8);
      this.pdf.text(splitDesc, this.margin + 5, this.currentY);
      this.currentY += splitDesc.length * 4 + 8;
    });
  }

  private async addCharts(): Promise<void> {
    this.addSectionTitle('3. Análisis Gráfico');

    this.pdf.setFontSize(10);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text('Los gráficos muestran la distribución de puntuaciones y análisis visual de los criterios evaluados.', this.margin, this.currentY);
    this.currentY += 10;

    // Capturar gráficos del DOM
    try {
      const chartsSection = document.querySelector('.charts-section');
      if (chartsSection) {
        const canvas = await html2canvas(chartsSection as HTMLElement, {
          scale: 2,
          logging: false,
          useCORS: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = this.pageWidth - 2 * this.margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (this.currentY + imgHeight > this.pageHeight - this.margin) {
          this.addNewPage();
        }

        this.pdf.addImage(imgData, 'PNG', this.margin, this.currentY, imgWidth, imgHeight);
        this.currentY += imgHeight + 10;
      }
    } catch (error) {
      console.error('Error capturando gráficos:', error);
      this.pdf.setTextColor(200, 0, 0);
      this.pdf.text('Error al generar gráficos. Por favor intente nuevamente.', this.margin, this.currentY);
    }
  }

  private addConclusion(report: EvaluationReport): void {
    this.addSectionTitle('4. Conclusión');

    this.pdf.setFontSize(11);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'normal');
    
    const conclusion = report.conclusion || 'Sin conclusión disponible.';
    const splitConclusion = this.pdf.splitTextToSize(conclusion, this.pageWidth - 2 * this.margin);
    
    this.pdf.text(splitConclusion, this.margin, this.currentY);
    this.currentY += splitConclusion.length * 6 + 15;

    // Firma/Sello
    this.pdf.setDrawColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, this.currentY, this.pageWidth / 2 - 10, this.currentY);
    this.currentY += 5;
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text('Evaluador de Calidad', this.margin, this.currentY);
  }

  private addSectionTitle(title: string): void {
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
    this.pdf.text(title, this.margin, this.currentY);
    
    // Línea debajo del título
    this.currentY += 3;
    this.pdf.setDrawColor(this.secondaryColor[0], this.secondaryColor[1], this.secondaryColor[2]);
    this.pdf.setLineWidth(0.8);
    this.pdf.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    
    this.currentY += 10;
    this.pdf.setTextColor(0, 0, 0);
  }

  private addNewPage(): void {
    this.pdf.addPage();
    this.currentY = this.margin;
  }

  private addPageNumbers(): void {
    const pageCount = this.pdf.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(150, 150, 150);
      this.pdf.text(
        `Página ${i} de ${pageCount}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );
    }
  }
}

export const generateEvaluationPDF = async (options: PDFGenerationOptions): Promise<void> => {
  const generator = new PDFGenerator();
  await generator.generateReport(options);
};
