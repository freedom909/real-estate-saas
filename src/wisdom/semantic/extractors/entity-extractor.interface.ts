// src/wisdom/semantic/extractors/entity-extractor.interface.ts
//
// Interface for dedicated entity extractors.
// Each extractor extracts one specific entity type from the message.

import { SemanticEntity } from "../semantic.entity";

export interface ISemanticEntityExtractor {
  /**
   * Extract entities of a specific type from the message.
   * @param message - The raw user input
   * @returns Array of extracted entities (can be empty)
   */
  extract(message: string): SemanticEntity[];
}
