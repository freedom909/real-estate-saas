// src/subgraphs/ai/domain/entities/ListingAIContext.ts

import { AnalysisResult } from "../AnalysisResult";

export interface ListingAIContext {

 listingId: string;

  title: string;

  description: string;

  categories: string[];

  amenities: string[];

  address: string;

  price: number;

  numOfBeds: number;

  numOfGuests: number;

  analysis?: AnalysisResult;
  seoKeywords: string[];
}