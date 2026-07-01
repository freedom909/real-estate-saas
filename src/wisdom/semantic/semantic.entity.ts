// src/wisdom/semantic/semantic.entity.ts

import { SemanticEntityType } from "./semantic.entityType";

export interface SemanticEntity {
    type: SemanticEntityType;
    value: string;
    confidence: number;
}
