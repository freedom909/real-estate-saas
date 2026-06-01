//src/modules/container/review.register.ts

import { container } from "tsyringe";
import { TOKENS_REVIEW } from "../tokens/review.tokens";
import { CreateReviewUseCase } from "@/subgraphs/review/application/usecase/CreateReviewUseCase";
import { UpdateReviewUseCase } from "@/subgraphs/review/application/usecase/UpdateReviewUseCase";
import { DeleteReviewUseCase } from "@/subgraphs/review/application/usecase/DeleteReviewUseCase";
import { ReplyToReviewUseCase } from "@/subgraphs/review/application/usecase/ReplyToReviewUseCase";
import { ReportReviewUseCase } from "@/subgraphs/review/application/usecase/ReportReviewUseCase";
import { ReviewRepositoryImpl } from "@/subgraphs/review/infrastructure/repos/ReviewRepositoryImpl";
import { ReviewModel } from "@/subgraphs/review/infrastructure/models/ReviewModel";
import { ReviewModerationPolicy } from "@/subgraphs/review/domain/services/ReviewModerationPolicy";
import { ReviewValidationService } from "@/subgraphs/review/domain/services/ReviewValidationService";

export function registerReviewDependencies() {
  // Models
  container.register(TOKENS_REVIEW.infrastructure.mongooseModel, { useValue: ReviewModel });

  // Repositories
  container.register(TOKENS_REVIEW.reviewRepository, { 
    useClass: ReviewRepositoryImpl 
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