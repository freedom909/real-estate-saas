// 提交主机回复到客机评论

import { TOKENS_REVIEW } from "@/modules/tokens/review.tokens";
import { inject, injectable } from "tsyringe";
import { IReviewRepository } from "../../domain/entities/repos/IReviewRepository";
import { ReviewMapper } from "../../infrastructure/models/ReviewMapper";
import { IReviewModerationPolicy } from "../../domain/entities/policy/IReviewModerationPolicy";

@injectable()
export class SubmitOwnerReplyToCustomerReviewUseCase {
    constructor(
    @inject(TOKENS_REVIEW.repository.reviewRepository)
    private reviewRepository: IReviewRepository,
    @inject(TOKENS_REVIEW.service.moderationPolicy)
    private moderationPolicy: IReviewModerationPolicy,
    @inject(TOKENS_REVIEW.service.reviewMapper)
    private reviewMapper: ReviewMapper,
    ){}
  
  async execute(input: any) {
    return await this.moderationPolicy.validateAndModerate(input);
  }
}


