// src/ai-platform/cognition/domain/agents/types/i-facet.resolver.ts

import { CapabilityType } from "./enums";


export interface IFacetResolver {
  resolve(capability: CapabilityType): IExecutor;
}

export interface IExecutor {
  execute(payload: Record<string, any>): Promise<any>;
}