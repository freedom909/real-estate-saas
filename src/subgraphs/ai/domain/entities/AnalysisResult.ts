//src/subgraphs/ai/domain/entities/AnalysisResult.ts

export interface AnalysisResult {
  score: number;

  seoScore: number;

  readability: number;

  problems: string[];
}