//src/modules/container/review.register.ts

import { container } from "tsyringe";
import { TOKENS_REVIEW } from "../tokens/review.tokens";
import { CreateReviewUseCase } from "@/subgraphs/review/application/usecase/CreateReviewUseCase";

import { ReviewModel } from "@/subgraphs/review/infrastructure/models/ReviewModel";
import { ReviewRepository } from "@/subgraphs/review/infrastructure/repos/ReviewRepository";
import { ReviewValidationService } from "@/subgraphs/review/infrastructure/services/ReviewValidationService";
import { ReviewModerationPolicy } from "@/subgraphs/review/infrastructure/services/ReviewModerationPolicy";
import { UpdateReviewUseCase } from "@/subgraphs/review/application/usecase/UpdateReviewUseCase";
import { DeleteReviewUseCase } from "@/subgraphs/review/application/usecase/DeleteReviewUseCase";

import { ReportReviewUseCase } from "@/subgraphs/review/application/usecase/reportReviewUseCase";
import { ReplyToReviewUseCase } from "@/subgraphs/review/application/usecase/ReplyToReviewUseCase";


export function registerReviewDependencies() {
  // Models
  container.register(TOKENS_REVIEW.infrastructure.mongooseModel, { useValue: ReviewModel });

  // Repositories
  container.register(TOKENS_REVIEW.repository.reviewRepository, { 
    useClass: ReviewRepository 
  });

  // Domain Services
  container.register(TOKENS_REVIEW.service.moderationPolicy, { useClass: ReviewModerationPolicy });
  container.register(TOKENS_REVIEW.service.validationService, { useClass: ReviewValidationService });

  // Use Cases
  container.register(TOKENS_REVIEW.usecase.createReview, { useClass: CreateReviewUseCase });
  container.register(TOKENS_REVIEW.usecase.updateReview, { useClass: UpdateReviewUseCase });
  container.register(TOKENS_REVIEW.usecase.deleteReview, { useClass: DeleteReviewUseCase });
  container.register(TOKENS_REVIEW.usecase.replyToReview, { useClass: ReplyToReviewUseCase });
  container.register(TOKENS_REVIEW.usecase.reportReview, { useClass: ReportReviewUseCase });
}