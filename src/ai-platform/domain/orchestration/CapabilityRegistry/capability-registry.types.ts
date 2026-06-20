import { AIDomain } from "@/ai-platform/domain/semantic/types/ai.domain";

export interface CapabilityRegistryEntry {
  domain: AIDomain;
  capability: any; // Replace with specific type later if needed
  dependsOn?: string[];
  compensation?: string[];
}

export interface CapabilityRegistryMap {
  [key: string]: CapabilityRegistryEntry;
}
