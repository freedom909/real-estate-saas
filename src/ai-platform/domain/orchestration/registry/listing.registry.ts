import { AIDomain } from "@/ai-platform/domain/semantic/types/ai.domain";
import { CapabilityRegistryMap, RiskLevel } from "./capability-registry.types";

export const ListingRegistry: CapabilityRegistryMap = {
  CREATE_LISTING: {
    id: "CREATE_LISTING",
    domain: AIDomain.LISTING,
    description: "Create new listing",
    preconditions: [],
    effects: [],
    inputs: [
      { name: "title", type: "string", description: "Listing title" },
      { name: "description", type: "string", description: "Listing description" },
      { name: "price", type: "number", description: "Nightly price" },
    ],
    outputs: [
      { name: "listingId", type: "string", entity: "listing", field: "id" },
    ],
    executorId: "listing.create",
    tags: ["listing", "create"],
    permissions: ["listing:create"],
    cost: 0,
    timeoutMs: 30000,
    riskLevel: RiskLevel.MEDIUM,
  },

  ACTIVATE_LISTING: {
    id: "ACTIVATE_LISTING",
    domain: AIDomain.LISTING,
    description: "Activate a listing to make it visible",
    preconditions: [],
    effects: [],
    inputs: [
      { name: "listingId", type: "string", entity: "listing", field: "id" },
    ],
    outputs: [
      { name: "listingId", type: "string", entity: "listing", field: "id" },
      { name: "status", type: "string" },
    ],
    executorId: "listing.activate",
    tags: ["listing", "activate"],
    permissions: ["listing:activate"],
    cost: 0,
    timeoutMs: 10000,
    riskLevel: RiskLevel.LOW,
  },

  DEACTIVATE_LISTING: {
    id: "DEACTIVATE_LISTING",
    domain: AIDomain.LISTING,
    description: "Deactivate a listing to hide it",
    preconditions: [],
    effects: [],
    inputs: [
      { name: "listingId", type: "string", entity: "listing", field: "id" },
    ],
    outputs: [
      { name: "listingId", type: "string", entity: "listing", field: "id" },
      { name: "status", type: "string" },
    ],
    executorId: "listing.deactivate",
    tags: ["listing", "deactivate"],
    permissions: ["listing:deactivate"],
    cost: 0,
    timeoutMs: 10000,
    riskLevel: RiskLevel.LOW,
  },

  OPTIMIZE_LISTING: {
    id: "OPTIMIZE_LISTING",
    domain: AIDomain.LISTING,
    description: "Optimize listing title, description and pricing",
    preconditions: [],
    effects: [],
    inputs: [
      { name: "listingId", type: "string", entity: "listing", field: "id" },
    ],
    outputs: [
      { name: "optimizedListing", type: "object", entity: "listing", field: "id" },
    ],
    executorId: "listing.optimize",
    tags: ["listing", "optimize"],
    permissions: ["listing:optimize"],
    cost: 0.1,
    timeoutMs: 60000,
    riskLevel: RiskLevel.LOW,
  },

  ANALYZE_LISTING: {
    id: "ANALYZE_LISTING",
    domain: AIDomain.LISTING,
    description: "Analyze listing performance and quality",
    preconditions: [],
    effects: [],
    inputs: [
      { name: "listingId", type: "string", entity: "listing", field: "id" },
    ],
    outputs: [
      { name: "analysisReport", type: "object" },
    ],
    executorId: "listing.analyze",
    tags: ["listing", "analyze"],
    permissions: ["listing:analyze"],
    cost: 0.05,
    timeoutMs: 30000,
    riskLevel: RiskLevel.LOW,
  },
};
