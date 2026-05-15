//src/subgraphs/review/infrastructure/services/ReviewModerationPolicy.ts

import { injectable } from "tsyringe";
import { ReviewModerationPolicy } from "../../domain/entities/contexts/ReviewModerationPolicy";
import { Review } from "../../domain/entities/Review";

@injectable()
export class ReviewModerationPolicy implements ReviewModerationPolicy {
    async execute(review: Review) {
        // 实现审核策略
        return true;
    }
}