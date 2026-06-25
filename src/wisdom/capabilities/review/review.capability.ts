import { injectable } from "tsyringe";

@injectable()
export class CreateReviewCapability {
  async execute(input: any) {
    return { success: true, ...input };
  }
}

@injectable()
export class RespondToReviewCapability {
  async execute(reviewId: string, response: string) {
    return { success: true, reviewId, response };
  }
}

@injectable()
export class AnalyzeReviewCapability {
  async execute(reviewId: string) {
    return { success: true, reviewId, sentiment: "positive" };
  }
}
