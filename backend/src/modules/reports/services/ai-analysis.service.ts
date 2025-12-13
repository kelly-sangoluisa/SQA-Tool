import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ReportsService } from './reports.service';
import type { AIAnalysisResponse, AIRecommendation } from '../dto/ai-analysis.dto';


@Injectable()
export class AIAnalysisService {
  private readonly logger = new Logger(AIAnalysisService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private configService: ConfigService,
    private reportsService: ReportsService,
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

    } catch (error) {
      this.logger.error(`Error generating AI analysis for project ${projectId}:`, error);
      throw new Error(`Failed to generate AI analysis: ${error.message}`);
    }
  }

  private buildAnalysisPrompt(report: any, stats: any): string {
    const evaluationsDetails = report.evaluations
      .map(e => `  - ${e.standard_name}: ${e.final_score.toFixed(1)}%`)
      .join('\n');

    return `
Eres un experto senior en aseguramiento de calidad de software con más de 15 años de experiencia en normas ISO/IEC 25010, CMMI y mejores prácticas de ingeniería de software.

Analiza los siguientes resultados de evaluación de calidad de software y proporciona un análisis profesional, específico y accionable:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 DATOS DEL PROYECTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Proyecto:** ${report.project_name}
${report.project_description ? `**Descripción:** ${report.project_description}` : ''}

**Resultados Principales:**
- 🎯 Puntuación Final: ${report.final_project_score.toFixed(1)}%
- 📏 Umbral Mínimo Requerido: ${report.minimum_threshold}%
- ✅ Estado: ${report.meets_threshold ? '✅ APROBADO - Cumple con el estándar' : '❌ NO APROBADO - Por debajo del umbral'}

**Estadísticas de Evaluaciones:**
- Total de evaluaciones realizadas: ${stats.total_evaluations}
- Evaluaciones completadas: ${stats.completed_evaluations}
- Promedio general: ${stats.average_evaluation_score.toFixed(1)}%
- 🏆 Mejor evaluación: ${stats.highest_evaluation.standard_name} (${stats.highest_evaluation.score.toFixed(1)}%)
- ⚠️ Evaluación más baja: ${stats.lowest_evaluation.standard_name} (${stats.lowest_evaluation.score.toFixed(1)}%)

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
      // Intentar extraer JSON de la respuesta
      // Gemini a veces envuelve el JSON en ```json ... ```
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                       text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }

      const jsonText = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonText);

      // Validar estructura básica
      if (!parsed.analisis_general || !parsed.fortalezas || !parsed.recomendaciones) {
        throw new Error('Invalid JSON structure from Gemini');
      }

      return parsed;
    } catch (error) {
      this.logger.error('Error parsing Gemini response:', error);
      this.logger.debug('Raw response:', text);
      
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
        }],
        riesgos: ['Análisis no disponible'],
        proximos_pasos: ['Reintentar análisis'],
      };
    }
  }
}
