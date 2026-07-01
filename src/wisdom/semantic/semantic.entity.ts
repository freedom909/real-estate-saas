// src/wisdom/semantic/semantic.entity.ts
import { EntityType } from "../shared/enums/entity-type.enum";

export interface SemanticEntity<T = unknown> {
    type: EntityType;
    value: T;
    confidence: number;
}
