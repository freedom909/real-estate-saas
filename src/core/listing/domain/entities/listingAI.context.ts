// src/subgraphs/listing/domain/entities/ai/ListingAIContext.ts

import { AnalysisResult } from "./analysisResult";



// AnalysisResult should also be moved to a shared location if generic, 
// or listing-specific folder if it contains listing-specific problems.


export interface ListingAIContext {
  id: string;

  title: string;

  description: string;
  categories: string[];
  amenities: string[];

  price: number;

  numOfBeds: number;

  numOfGuests: number;

  analysis?: AnalysisResult;
  seoKeywords: string[];
}