// IReviewModerationPolicy.ts
export interface IReviewModerationPolicy {
  validateAndModerate(input: any): Promise<any>;
  
}