// src/wisdom/conversation/reference/resolved-reference.ts
import { EntityType } from "@/wisdom/semantic/semantic-context";
import { AIContext } from "@/wisdom/contracts/ai-context";
import { SemanticContext } from "@/wisdom/semantic/semantic-context";
import { ReferenceResolver } from "./reference.resolver";



export enum ReferenceType {
  CURRENT = "CURRENT",
  LAST = "LAST",
  PREVIOUS = "PREVIOUS",
  ORDINAL = "ORDINAL",
}

export interface ResolvedReference {
  entityType: EntityType;
  entityId: string;
  source: ReferenceType;
  confidence: number;
}