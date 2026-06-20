import { AIDomain } from "@/ai-platform/domain/semantic/types/ai.domain";
import {
  CreateReviewCapability,
  RespondToReviewCapability,
  AnalyzeReviewCapability
} from "@/ai-platform/application/capabilities/review/review.capability";

export const ReviewRegistry = {
  CREATE_REVIEW: {
    domain: AIDomain.REVIEW,
    capability: CreateReviewCapability,
    dependsOn: ["COMPLETE_BOOKING"]
  },
  RESPOND_TO_REVIEW: {
    domain: AIDomain.REVIEW,
    capability: RespondToReviewCapability,
    dependsOn: ["CREATE_REVIEW"]
  },
  ANALYZE_REVIEW: {
    domain: AIDomain.REVIEW,
    capability: AnalyzeReviewCapability,
    dependsOn: ["CREATE_REVIEW"]
  }
};
