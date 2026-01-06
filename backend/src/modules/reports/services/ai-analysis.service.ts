import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ReportsService } from './reports.service';
import type { AIAnalysisResponse } from '../dto/ai-analysis.dto';
import { ProjectReportDto, ProjectStatsDto } from '../dto/evaluation-report.dto';


@Injectable()
export class AIAnalysisService {
  private readonly logger = new Logger(AIAnalysisService.name);
  private readonly genAI?: GoogleGenerativeAI;
  private readonly model: GenerativeModel | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly reportsService: ReportsService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not configured. AI analysis will be disabled.');
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
      },
    });
    
    this.logger.log('AI Analysis Service initialized with Gemini 2.5 Flash');
  }

  async analyzeProjectQuality(projectId: number): Promise<AIAnalysisResponse> {
    if (!this.model) {
      throw new Error('Gemini AI is not configured. Please set GEMINI_API_KEY environment variable.');
    }

    try {
      this.logger.log(`Starting AI analysis for project ${projectId}`);

      // Obtener datos del proyecto
      const report = await this.reportsService.getProjectReport(projectId);
      const stats = await this.reportsService.getProjectStats(projectId);

      // Construir prompt contextual
      const prompt = this.buildAnalysisPrompt(report, stats);

      // Llamar a Gemini
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      this.logger.debug(`Raw Gemini response: ${text.substring(0, 200)}...`);

      // Parsear respuesta JSON
      const analysis = this.parseGeminiResponse(text);

      // Enriquecer con metadata
      const enrichedAnalysis: AIAnalysisResponse = {
        projectId,
        projectName: report.project_name,
        analisis_general: analysis.analisis_general || '',
        fortalezas: analysis.fortalezas || [],
        debilidades: analysis.debilidades || [],
        recomendaciones: analysis.recomendaciones || [],
        riesgos: analysis.riesgos || [],
        proximos_pasos: analysis.proximos_pasos || [],
        generatedAt: new Date(),
        metadata: {
          score: report.final_project_score,
          threshold: report.minimum_threshold,
          meetsThreshold: report.meets_threshold,
          totalEvaluations: stats.total_evaluations,
        },
      };

      this.logger.log(`AI analysis completed successfully for project ${projectId}`);
      return enrichedAnalysis;

    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error generating AI analysis for project ${projectId}:`, error);
      
      // Si el servicio de IA está sobrecargado, devolver un mensaje amigable
      const isOverloaded = error?.status === 503 || errorMessage.includes('overloaded');
      const isRateLimited = error?.status === 429 || errorMessage.includes('rate limit');
      
      if (isOverloaded || isRateLimited) {
        const report = await this.reportsService.getProjectReport(projectId);
        const stats = await this.reportsService.getProjectStats(projectId);
        
        return {
          projectId,
          projectName: report.project_name,
          analisis_general: '⚠️ El servicio de análisis con IA de Google Gemini no está disponible en este momento debido a alta demanda. Por favor, intente nuevamente en unos minutos. Los resultados de su evaluación están disponibles en las secciones anteriores.',
          fortalezas: ['Análisis con IA temporalmente no disponible'],
          debilidades: ['Análisis con IA temporalmente no disponible'],
          recomendaciones: [{
            prioridad: 'Media',
            titulo: 'Servicio de IA temporalmente no disponible',
            descripcion: 'El análisis automatizado con inteligencia artificial no pudo completarse debido a que el servicio de Google Gemini está experimentando alta demanda. Sus datos de evaluación han sido guardados correctamente y puede intentar generar el análisis nuevamente en unos minutos.',
            impacto: 'Sin impacto en sus evaluaciones - solo el análisis automático está temporalmente no disponible',
            categoria: 'Sistema',
          }],
          riesgos: ['Análisis con IA temporalmente no disponible'],
          proximos_pasos: [
            'Espere unos minutos y haga clic nuevamente en "Analizar con IA"',
            'Revise los resultados numéricos de su evaluación en las secciones anteriores',
            'Contacte al administrador si el problema persiste por más de 15 minutos'
          ],
          generatedAt: new Date(),
          metadata: {
            score: report.final_project_score,
            threshold: report.minimum_threshold,
            meetsThreshold: report.meets_threshold,
            totalEvaluations: stats.total_evaluations,
          },
        };
      }
      
      throw new Error(`Failed to generate AI analysis: ${errorMessage}`);
    }
  }

  private buildAnalysisPrompt(report: ProjectReportDto, stats: ProjectStatsDto): string {
    // Validar que los datos existen antes de acceder
    if (!report || !stats) {
      throw new Error('Invalid report or stats data');
    }

    const evaluationsDetails = (report.evaluations && Array.isArray(report.evaluations))
      ? report.evaluations
          .map(e => `  - ${e.standard_name || 'Unknown'}: ${(e.final_score || 0).toFixed(1)}`)
          .join('\n')
      : 'No evaluations available';

    const projectName = report.project_name || 'Unknown Project';
    const projectDescription = report.project_description || '';
    const finalScore = report.final_project_score || 0;
    const minThreshold = report.minimum_threshold || 0;
    const meetsThreshold = report.meets_threshold || false;
    
    const totalEvals = stats.total_evaluations || 0;
    const completedEvals = stats.completed_evaluations || 0;
    const avgScore = stats.average_evaluation_score || 0;
    const highestEval = stats.highest_evaluation?.standard_name || 'N/A';
    const highestScore = stats.highest_evaluation?.score || 0;
    const lowestEval = stats.lowest_evaluation?.standard_name || 'N/A';
    const lowestScore = stats.lowest_evaluation?.score || 0;

    return `
Eres un experto senior en aseguramiento de calidad de software con más de 15 años de experiencia en normas ISO/IEC 25010, CMMI y mejores prácticas de ingeniería de software.

Analiza los siguientes resultados de evaluación de calidad de software y proporciona un análisis profesional, específico y accionable:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 DATOS DEL PROYECTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Proyecto:** ${projectName}
${projectDescription ? `**Descripción:** ${projectDescription}` : ''}

**Resultados Principales:**
- 🎯 Puntuación Final: ${finalScore.toFixed(1)}
- 📏 Umbral Mínimo Requerido: ${minThreshold}
- ✅ Estado: ${meetsThreshold ? '✅ APROBADO - Cumple con el estándar' : '❌ NO APROBADO - Por debajo del umbral'}

**Estadísticas de Evaluaciones:**
- Total de evaluaciones realizadas: ${totalEvals}
- Evaluaciones completadas: ${completedEvals}
- Promedio general: ${avgScore.toFixed(1)}
- 🏆 Mejor evaluación: ${highestEval} (${highestScore.toFixed(1)})
- ⚠️ Evaluación más baja: ${lowestEval} (${lowestScore.toFixed(1)})

**Detalle de Evaluaciones por Estándar:**
${evaluationsDetails}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Por favor, proporciona un análisis profesional y estructurado en formato JSON con la siguiente estructura:

{
  "analisis_general": "Un análisis comprensivo de 3-4 párrafos que evalúe el estado actual de calidad del software. Considera el contexto del puntaje, si cumple o no el umbral, y qué significa esto en términos prácticos para el proyecto.",
  
  "fortalezas": [
    "Fortaleza específica 1 con evidencia numérica",
    "Fortaleza específica 2 con evidencia numérica",
    "Fortaleza específica 3 con evidencia numérica"
  ],
  
  "debilidades": [
    "Debilidad específica 1 con impacto medible",
    "Debilidad específica 2 con impacto medible",
    "Debilidad específica 3 con impacto medible"
  ],
  
  "recomendaciones": [
    {
      "prioridad": "Alta",
      "titulo": "Título corto y accionable",
      "descripcion": "Descripción detallada de QUÉ hacer, CÓMO hacerlo, y POR QUÉ es importante. Incluye pasos específicos.",
      "impacto": "Impacto estimado cuantificable en el proyecto",
      "categoria": "Categoría relevante (Seguridad, Rendimiento, Mantenibilidad, etc.)"
    }
  ],
  
  "riesgos": [
    "Riesgo específico 1 si no se atienden las debilidades",
    "Riesgo específico 2 con posible impacto",
    "Riesgo específico 3 a largo plazo"
  ],
  
  "proximos_pasos": [
    "Paso accionable 1 a corto plazo (1-2 semanas)",
    "Paso accionable 2 a mediano plazo (1 mes)",
    "Paso accionable 3 a largo plazo (3 meses)"
  ]
}

IMPORTANTE:
1. Sé específico y usa los datos numéricos proporcionados
2. Las recomendaciones deben ser ACCIONABLES, no genéricas
3. Prioriza al menos 5 recomendaciones (2-3 Alta, 2 Media, 1 Baja)
4. Responde ÚNICAMENTE con el JSON, sin texto adicional antes o después
5. Usa lenguaje profesional pero comprensible
6. Si el proyecto está aprobado, enfócate en optimización; si no, en corrección
`;
  }

  private parseGeminiResponse(text: string): Partial<AIAnalysisResponse> {
    try {
      this.logger.debug(`Parsing Gemini response (length: ${text.length})`);
      
      // Limpiar el texto: remover todos los bloques de código markdown
      let cleanText = text;
      
      // Remover bloques ```json ... ```
      cleanText = cleanText.replace(/```json\s*/g, '');
      cleanText = cleanText.replace(/```\s*/g, '');
      
      // Buscar el JSON válido completo
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('No JSON object found in Gemini response');
      }
      
      const jsonText = cleanText.substring(firstBrace, lastBrace + 1).trim();
      this.logger.debug(`Extracted JSON text (length: ${jsonText.length})`);
      
      // Parsear JSON
      const parsed = JSON.parse(jsonText);

      // Validar estructura básica
      if (!parsed.analisis_general) {
        throw new Error('Missing analisis_general in response');
      }
      
      // Asegurar que todos los arrays existan
      parsed.fortalezas = parsed.fortalezas || [];
      parsed.debilidades = parsed.debilidades || [];
      parsed.recomendaciones = parsed.recomendaciones || [];
      parsed.riesgos = parsed.riesgos || [];
      parsed.proximos_pasos = parsed.proximos_pasos || [];

      this.logger.debug(`Successfully parsed response with ${parsed.recomendaciones.length} recommendations`);
      return parsed;
      
    } catch (error) {
      this.logger.error('Error parsing Gemini response:', error);
      this.logger.debug('Raw response:', text.substring(0, 500));
      
      // Retornar análisis de fallback
      return {
        analisis_general: 'Error al parsear la respuesta de IA. Por favor intente nuevamente.',
        fortalezas: ['Análisis no disponible'],
        debilidades: ['Análisis no disponible'],
        recomendaciones: [{
          prioridad: 'Media',
          titulo: 'Error al generar análisis',
          descripcion: 'Hubo un problema al procesar la respuesta de IA.',
          impacto: 'N/A',
          categoria: 'Error',
        }],
        riesgos: ['Análisis no disponible'],
        proximos_pasos: ['Reintentar análisis'],
      };
    }
  }
}
