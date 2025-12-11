import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { EvaluationReport, EvaluationStats } from '@/api/reports/reports.types';

interface PDFGenerationOptions {
  report: EvaluationReport;
  stats: EvaluationStats;
  radarImageData?: string | null;
  includeCertificate?: boolean;
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
    const { report, stats, radarImageData, includeCertificate } = options;

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
    await this.addCharts(radarImageData);

    // Conclusión
    this.addNewPage();
    this.addConclusion(report);

    // Certificado de Cumplimiento (solo si cumple umbral y está habilitado)
    const shouldIncludeCertificate = includeCertificate && report.meets_threshold;
    if (shouldIncludeCertificate) {
      this.addNewPage();
      this.addCertificate(report);
      
      // Agregar sello en la portada solo si se incluye certificado
      this.pdf.setPage(1);
      await this.addApprovalSeal();
    }

    // Pie de página en todas las páginas (excepto certificado)
    this.addPageNumbers(shouldIncludeCertificate);

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
    
    // Score con más separación
    this.pdf.setFont('helvetica', 'normal');
    const scoreColor = report.final_score >= 80 ? [16, 185, 129] : 
                        report.final_score >= 60 ? [245, 158, 11] : [239, 68, 68];
    this.pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    this.pdf.setFontSize(24);
    this.pdf.text(`${report.final_score.toFixed(1)}%`, this.margin + 40, this.currentY);

    // Badge de estado
    this.currentY += 15;
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Estado:', this.margin, this.currentY);
    
    const meetsThreshold = report.meets_threshold;
    const badgeColor = meetsThreshold ? [16, 185, 129] : [239, 68, 68];
    this.pdf.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    this.pdf.roundedRect(this.margin + 23, this.currentY - 6, 35, 10, 2, 2, 'F');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(meetsThreshold ? 'APROBADO' : 'NO APROBADO', this.margin + 40.5, this.currentY, { align: 'center' });

    // Footer en 3 líneas bien separadas con más espacio
    this.pdf.setTextColor(128, 128, 128);
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Generado automáticamente por SQA Tool', this.pageWidth / 2, this.pageHeight - 28, { align: 'center' });
    this.pdf.text(new Date().toLocaleDateString('es-ES'), this.pageWidth / 2, this.pageHeight - 20, { align: 'center' });
    this.pdf.text(new Date().toLocaleTimeString('es-ES'), this.pageWidth / 2, this.pageHeight - 14, { align: 'center' });

  }

  private async addApprovalSeal(): Promise<void> {
    try {
      // Cargar la imagen del sello
      const response = await fetch('/seal.png');
      const blob = await response.blob();
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onloadend = () => {
          const base64data = reader.result as string;
          
          // Posición y tamaño del sello (más grande y más abajo)
          const sealX = this.pageWidth - 78;
          const sealY = 130;
          const sealWidth = 65;
          const sealHeight = 65;
          
          // Agregar la imagen del sello al PDF
          this.pdf.addImage(base64data, 'PNG', sealX, sealY, sealWidth, sealHeight);
          
          resolve();
        };
        
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error al cargar el sello:', error);
      // Si falla, no hace nada (el PDF se genera sin sello)
    }
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

    // Mejor y peor criterio - Solo mostrar ambos si son diferentes
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(12);
    
    if (stats.best_criterion.name !== stats.worst_criterion.name) {
      // Hay múltiples criterios - mostrar mejor y peor
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Mejor Criterio:', this.margin, this.currentY);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(`${stats.best_criterion.name} (${stats.best_criterion.score.toFixed(1)}%)`, this.margin + 35, this.currentY);

      this.currentY += 10;
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Criterio a Mejorar:', this.margin, this.currentY);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(`${stats.worst_criterion.name} (${stats.worst_criterion.score.toFixed(1)}%)`, this.margin + 42, this.currentY);
    } else {
      // Solo un criterio - mostrar una vez
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Criterio Evaluado:', this.margin, this.currentY);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(`${stats.best_criterion.name} (${stats.best_criterion.score.toFixed(1)}%)`, this.margin + 40, this.currentY);
    }

    this.currentY += 15;
    
    // Estado de cumplimiento - centrado
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
    const umbralText = `Umbral mínimo: ${report.project_threshold}% | Obtenido: ${report.final_score.toFixed(1)}%`;
    const umbralWidth = this.pdf.getTextWidth(umbralText);
    this.pdf.text(umbralText, (this.pageWidth - umbralWidth) / 2, this.currentY);
  }

  private addCriteriaDetails(report: EvaluationReport): void {
    this.addSectionTitle('2. Detalles de Criterios');

    this.pdf.setFontSize(10);
    
    report.criteria_results.forEach((criterion, index) => {
      if (this.currentY > this.pageHeight - 60) {
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
      this.currentY += splitDesc.length * 4 + 5;

      // Métricas del criterio
      if (criterion.metrics && criterion.metrics.length > 0) {
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setFontSize(9);
        this.pdf.setTextColor(50, 50, 50);
        this.pdf.text('Métricas:', this.margin + 5, this.currentY);
        this.currentY += 5;

        criterion.metrics.forEach((metric, metricIdx) => {
          if (this.currentY > this.pageHeight - 50) {
            this.addNewPage();
          }

          // Código y descripción de métrica
          this.pdf.setFont('helvetica', 'bold');
          this.pdf.setFontSize(8);
          this.pdf.setTextColor(70, 70, 70);
          this.pdf.text(`  ${metricIdx + 1}) ${metric.metric_code}: ${metric.metric_description}`, this.margin + 8, this.currentY);
          this.currentY += 4;

          // Fórmula
          if (metric.formula) {
            this.pdf.setFont('helvetica', 'italic');
            this.pdf.setTextColor(100, 100, 100);
            this.pdf.text(`     Fórmula: ${metric.formula}`, this.margin + 8, this.currentY);
            this.currentY += 4;
          }

          // Variables
          if (metric.variables && metric.variables.length > 0) {
            this.pdf.setFont('helvetica', 'normal');
            this.pdf.setFontSize(7);
            metric.variables.forEach(variable => {
              this.pdf.text(`     ${variable.symbol} = ${variable.value} (${variable.description})`, this.margin + 8, this.currentY);
              this.currentY += 3.5;
            });
          }

          // Valores calculados
          this.pdf.setFont('helvetica', 'normal');
          this.pdf.setFontSize(8);
          this.pdf.setTextColor(60, 60, 60);
          this.pdf.text(`     Calculado: ${metric.calculated_value.toFixed(2)} | Ponderado: ${metric.weighted_value.toFixed(2)} | Umbral: ${metric.desired_threshold}`, this.margin + 8, this.currentY);
          
          // Indicador de cumplimiento
          const meetsMetric = metric.meets_threshold;
          this.pdf.setTextColor(meetsMetric ? 16 : 239, meetsMetric ? 185 : 68, meetsMetric ? 129 : 68);
          this.pdf.text(meetsMetric ? ' ✓' : ' ✗', this.pageWidth - this.margin - 15, this.currentY);
          
          this.currentY += 6;
        });
      }

      this.currentY += 3;
    });
  }

  private async addCharts(radarImageData?: string | null): Promise<void> {
    this.addSectionTitle('3. Análisis Gráfico');

    this.pdf.setFontSize(10);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text('Los gráficos muestran la distribución de puntuaciones y análisis visual de los criterios evaluados.', this.margin, this.currentY);
    this.currentY += 10;

    // Pequeño delay para asegurar que el DOM esté completamente renderizado
    await new Promise(resolve => setTimeout(resolve, 200));

    // Capturar gráficos principales del DOM
    try {
      const chartsSection = document.querySelector('.charts-section') as HTMLElement;
      
      if (chartsSection && chartsSection.offsetHeight > 0) {
        // Capturar con escala balanceada
        const canvas = await html2canvas(chartsSection, {
          scale: 2,
          logging: false,
          useCORS: true,
          backgroundColor: '#ffffff',
        });
        
        const imgData = canvas.toDataURL('image/png', 1.0);
        // Mantener márgenes consistentes
        const imgWidth = this.pageWidth - 2 * this.margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (this.currentY + imgHeight > this.pageHeight - this.margin) {
          this.addNewPage();
        }

        this.pdf.addImage(imgData, 'PNG', this.margin, this.currentY, imgWidth, imgHeight);
        this.currentY += imgHeight + 15;
      } else {
        console.warn('ChartsSection no encontrada o no visible');
        this.pdf.setTextColor(200, 100, 0);
        this.pdf.text('No se pudieron capturar los gráficos principales.', this.margin, this.currentY);
        this.currentY += 10;
      }

      // Usar la imagen pre-capturada del radar si existe
      if (radarImageData) {
        // Verificar espacio
        if (this.currentY + 80 > this.pageHeight - this.margin) {
          this.addNewPage();
        }

        this.pdf.setFontSize(11);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
        this.pdf.text('Gráfico de Radar - Balance de Criterios', this.margin, this.currentY);
        this.currentY += 8;

        // Crear imagen temporal para obtener dimensiones
        const img = new Image();
        img.src = radarImageData;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const radarImgWidth = this.pageWidth - 2 * this.margin;
        const radarImgHeight = (img.height * radarImgWidth) / img.width;

        if (this.currentY + radarImgHeight > this.pageHeight - this.margin) {
          this.addNewPage();
        }

        this.pdf.addImage(radarImageData, 'PNG', this.margin, this.currentY, radarImgWidth, radarImgHeight);
        this.currentY += radarImgHeight + 10;
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
    this.currentY += splitConclusion.length * 6 + 30;

    // Línea de firma
    this.pdf.setDrawColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, this.currentY, this.pageWidth / 2 - 10, this.currentY);
    this.currentY += 5;
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(`Firma: ${report.created_by_name}`, this.margin, this.currentY);
    this.currentY += 4;
    this.pdf.setFontSize(8);
    this.pdf.text('Evaluador de Calidad', this.margin, this.currentY);
  }

  private addCertificate(report: EvaluationReport): void {
    // Fondo con gradiente sutil (usando rectángulos)
    this.pdf.setFillColor(248, 250, 252);
    this.pdf.rect(0, 0, this.pageWidth, this.pageHeight, 'F');

    // Borde decorativo externo
    this.pdf.setDrawColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
    this.pdf.setLineWidth(3);
    this.pdf.rect(15, 15, this.pageWidth - 30, this.pageHeight - 30, 'S');

    // Borde decorativo interno
    this.pdf.setLineWidth(0.5);
    this.pdf.rect(18, 18, this.pageWidth - 36, this.pageHeight - 36, 'S');

    // Título principal
    this.currentY = 40;
    this.pdf.setFontSize(28);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
    this.pdf.text('CERTIFICADO DE CUMPLIMIENTO', this.pageWidth / 2, this.currentY, { align: 'center' });

    // Línea decorativa debajo del título
    this.currentY += 6;
    this.pdf.setDrawColor(this.secondaryColor[0], this.secondaryColor[1], this.secondaryColor[2]);
    this.pdf.setLineWidth(1);
    this.pdf.line(40, this.currentY, this.pageWidth - 40, this.currentY);

    // Subtítulo
    this.currentY += 15;
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(80, 80, 80);
    this.pdf.text('Sistema de Evaluación de Calidad de Software', this.pageWidth / 2, this.currentY, { align: 'center' });

    // Texto introductorio
    this.currentY += 20;
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(60, 60, 60);
    const introText = 'Se certifica que el proyecto evaluado ha cumplido satisfactoriamente con los';
    this.pdf.text(introText, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 6;
    this.pdf.text('estándares de calidad establecidos, alcanzando los criterios requeridos.', this.pageWidth / 2, this.currentY, { align: 'center' });

    // Box con información del proyecto
    this.currentY += 20;
    const boxX = 30;
    const boxWidth = this.pageWidth - 60;
    const boxHeight = 65;
    
    // Fondo del box
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.roundedRect(boxX, this.currentY, boxWidth, boxHeight, 3, 3, 'F');
    this.pdf.setDrawColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
    this.pdf.setLineWidth(0.5);
    this.pdf.roundedRect(boxX, this.currentY, boxWidth, boxHeight, 3, 3, 'S');

    // Información del proyecto dentro del box
    let infoY = this.currentY + 12;
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
    this.pdf.text('Nombre del Proyecto:', boxX + 10, infoY);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(40, 40, 40);
    this.pdf.text(report.project_name, boxX + 60, infoY);

    infoY += 10;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
    this.pdf.text('Estándar Aplicado:', boxX + 10, infoY);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(40, 40, 40);
    this.pdf.text(report.standard_name, boxX + 60, infoY);

    infoY += 10;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
    this.pdf.text('Puntuación Final:', boxX + 10, infoY);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(14);
    const scoreColor = report.final_score >= 80 ? [16, 185, 129] : [245, 158, 11];
    this.pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    this.pdf.text(`${report.final_score.toFixed(1)}%`, boxX + 60, infoY);

    infoY += 10;
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
    this.pdf.text('Umbral Requerido:', boxX + 10, infoY);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(40, 40, 40);
    this.pdf.text(`${report.project_threshold}%`, boxX + 60, infoY);

    infoY += 10;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
    this.pdf.text('Fecha de Evaluación:', boxX + 10, infoY);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(40, 40, 40);
    this.pdf.text(new Date(report.created_at).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }), boxX + 60, infoY);

    // Badge de aprobación
    this.currentY = this.currentY + boxHeight + 25;
    this.pdf.setFillColor(16, 185, 129);
    const badgeWidth = 55;
    const badgeHeight = 14;
    this.pdf.roundedRect((this.pageWidth - badgeWidth) / 2, this.currentY - 8, badgeWidth, badgeHeight, 3, 3, 'F');
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.text('APROBADO', this.pageWidth / 2, this.currentY, { align: 'center' });

    // Espacio para firma
    this.currentY += 35;
    this.pdf.setDrawColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.pageWidth / 2 - 40, this.currentY, this.pageWidth / 2 + 40, this.currentY);
    
    this.currentY += 5;
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(80, 80, 80);
    this.pdf.text(report.created_by_name, this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 5;
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text('Evaluador de Calidad', this.pageWidth / 2, this.currentY, { align: 'center' });

    // Footer del certificado - dentro del marco
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(120, 120, 120);
    this.pdf.text('Este certificado es generado automáticamente por el Sistema de Evaluación SQA', this.pageWidth / 2, this.pageHeight - 32, { align: 'center' });
    this.pdf.text(`Documento emitido el ${new Date().toLocaleDateString('es-ES')}`, this.pageWidth / 2, this.pageHeight - 26, { align: 'center' });
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

  private addPageNumbers(includeCertificate: boolean = false): void {
    const pageCount = this.pdf.getNumberOfPages();
    const pagesWithNumbers = includeCertificate ? pageCount - 1 : pageCount;
    
    for (let i = 1; i <= pagesWithNumbers; i++) {
      this.pdf.setPage(i);
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

export const generateEvaluationPDF = async (options: PDFGenerationOptions): Promise<void> => {
  const generator = new PDFGenerator();
  await generator.generateReport(options);
};
