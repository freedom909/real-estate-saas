export const TOKENS_REVIEW = {
  repository: {
    reviewRepository: Symbol.for("IReviewRepository"),
  },
  usecase: {
    createReview: Symbol.for("CreateReviewUseCase"),
    updateReview: Symbol.for("UpdateReviewUseCase"),
    deleteReview: Symbol.for("DeleteReviewUseCase"),
    replyToReview: Symbol.for("ReplyToReviewUseCase"),
    reportReview: Symbol.for("ReportReviewUseCase"),
    getListingReviews: Symbol.for("GetListingReviewsUseCase"),
    getHostReviews: Symbol.for("GetHostReviewsUseCase"),
  },
  service: {
    moderationPolicy: Symbol.for("ReviewModerationPolicy"),
    validationService: Symbol.for("ReviewValidationService"),
  },
  infrastructure: {
    mongooseModel: Symbol.for("ReviewMongooseModel"),
  },
};