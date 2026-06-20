import { AIDomain } from "@/ai-platform/domain/semantic/types/ai.domain";
import {
  CreateListingCapability,
  ActivateCapability,
  DeactivateCapability,
  OptimizeListingCapability,
  AnalyzeListingCapability
} from "@/ai-platform/application/capabilities/listing/listing.capability";

export const ListingRegistry = {
  CREATE_LISTING: {
    domain: AIDomain.LISTING,
    capability: CreateListingCapability
  },
  ACTIVATE_LISTING: {
    domain: AIDomain.LISTING,
    capability: ActivateCapability,
    dependsOn: ["CREATE_LISTING"]
  },
  DEACTIVATE_LISTING: {
    domain: AIDomain.LISTING,
    capability: DeactivateCapability,
    dependsOn: ["ACTIVATE_LISTING"]
  },
  OPTIMIZE_LISTING: {
    domain: AIDomain.LISTING,
    capability: OptimizeListingCapability,
    dependsOn: ["ACTIVATE_LISTING"]
  },
  ANALYZE_LISTING: {
    domain: AIDomain.LISTING,
    capability: AnalyzeListingCapability
  }
};