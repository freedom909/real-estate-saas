import { AIDomain } from "@/ai-platform/domain/semantic/types/ai.domain";
import { CapabilityRegistryMap, RiskLevel } from "./capability-registry.types";
import { Operator } from "../state/world-state";

export const ReviewRegistry: CapabilityRegistryMap = {
  CREATE_REVIEW: {
    id: "CREATE_REVIEW",
    domain: AIDomain.REVIEW,
    description: "Create a new review for a completed booking",
    preconditions: [
      { entity: "booking", field: "status", operator: Operator.EQ, value: "completed" },
    ],
    effects: [
      { entity: "review", field: "created", value: true },
    ],
    inputs: [
      { name: "bookingId", type: "string", entity: "booking", field: "id" },
      { name: "rating", type: "number" },
      { name: "comment", type: "string" },
    ],
    outputs: [
      { name: "reviewId", type: "string", entity: "review", field: "id" },
    ],
    executorId: "review.create",
    tags: ["review", "create"],
    permissions: ["review:create"],
    cost: 0,
    timeoutMs: 10000,
    sideEffects: ["host.notified"],
    riskLevel: RiskLevel.MEDIUM,
  },

  RESPOND_TO_REVIEW: {
    id: "RESPOND_TO_REVIEW",
    domain: AIDomain.REVIEW,
    description: "Host responds to a guest review",
    preconditions: [
      { entity: "review", field: "created", operator: Operator.EQ, value: true },
    ],
    effects: [],
    inputs: [
      { name: "reviewId", type: "string", entity: "review", field: "id" },
      { name: "response", type: "string" },
    ],
    outputs: [
      { name: "reviewId", type: "string", entity: "review", field: "id" },
      { name: "response", type: "string" },
    ],
    executorId: "review.respond",
    tags: ["review", "respond"],
    permissions: ["review:respond"],
    cost: 0,
    timeoutMs: 5000,
    riskLevel: RiskLevel.LOW,
  },

  ANALYZE_REVIEW: {
    id: "ANALYZE_REVIEW",
    domain: AIDomain.REVIEW,
    description: "Analyze review sentiment and content",
    preconditions: [
      { entity: "review", field: "created", operator: Operator.EQ, value: true },
    ],
    effects: [],
    inputs: [
      { name: "reviewId", type: "string", entity: "review", field: "id" },
    ],
    outputs: [
      { name: "sentiment", type: "string" },
      { name: "keywords", type: "string[]" },
    ],
    executorId: "review.analyze",
    tags: ["review", "analyze"],
    permissions: ["review:analyze"],
    cost: 0.05,
    timeoutMs: 30000,
    riskLevel: RiskLevel.LOW,
  },
};
