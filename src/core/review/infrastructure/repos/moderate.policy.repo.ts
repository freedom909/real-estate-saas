import { IReviewModerationPolicy } from "../../domain/entities/policy/IReviewModerationPolicy";


export class ModeratePolicyRepository implements IReviewModerationPolicy {
  async validateAndModerate(input: any): Promise<any> {
    return input;
  }
}
