// src/gateway/cognition/domain/semantic/types/i-semantic.extractor.ts

import { SemanticContext } from "../semantic-context";



export interface ISemanticExtractor {
  extract(message: string): Promise<SemanticContext>;
}