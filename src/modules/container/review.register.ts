//src/modules/container/review.register.ts

import { container } from "tsyringe";
import { TOKENS_REVIEW } from "../tokens/review.tokens";
import { ReviewRepositoryImpl } from "@/core/review/infrastructure/repos/ReviewRepository";
import { ReviewModel } from "@/core/review/infrastructure/models/ReviewModel";

import { SubmitHostReplyToGuestReviewUseCase } from "@/core/review/application/usecase/submitHostReplyToGuestReviewUseCase";
import { ModeratePolicyRepository } from "@/core/review/infrastructure/repos/moderate.policy.repo";
import { SubmitGuestReviewUseCase } from "@/core/review/application/usecase/createReviewUseCase";




export function registerReviewDependencies() {
  // Models
  container.register(TOKENS_REVIEW.infrastructure.mongooseModel, { useValue: ReviewModel });

  // Repositories
  container.register(TOKENS_REVIEW.repository.reviewRepository, { 
    useClass: ReviewRepositoryImpl 
  });

  // // Domain Services
   container.register(TOKENS_REVIEW.service.moderationPolicy, { useClass: ModeratePolicyRepository });
  // container.register(TOKENS_REVIEW.service.validationService, { useClass: ReviewValidationService });

  // Use Cases
  container.register(TOKENS_REVIEW.usecase.submitGuestReview, { useClass: SubmitGuestReviewUseCase });
  container.register(TOKENS_REVIEW.usecase.submitHostReplyToGuestReview, { useClass: SubmitHostReplyToGuestReviewUseCase });
  // container.register(TOKENS_REVIEW.usecase.updateReview, { useClass: UpdateReviewUseCase });
  // container.register(TOKENS_REVIEW.usecase.deleteReview, { useClass: DeleteReviewUseCase });
  // container.register(TOKENS_REVIEW.usecase.replyToReview, { useClass: ReplyToReviewUseCase });
  // container.register(TOKENS_REVIEW.usecase.reportReview, { useClass: ReportReviewUseCase });
}