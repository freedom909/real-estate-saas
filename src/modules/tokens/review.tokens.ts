export const TOKENS_REVIEW = {
  repository: {
    reviewRepository: Symbol.for("ReviewRepository"),
  },
  usecase: {
    submitCustomerReview: Symbol.for("SubmitCustomerReviewUseCase"),
    updateReview: Symbol.for("UpdateReviewUseCase"),
    deleteReview: Symbol.for("DeleteReviewUseCase"),
    replyToReview: Symbol.for("ReplyToReviewUseCase"),
    reportReview: Symbol.for("ReportReviewUseCase"),
    getListingReviews: Symbol.for("GetListingReviewsUseCase"),
    getOwnerReviews: Symbol.for("GetOwnerReviewsUseCase"),
    submitOwnerReplyToCustomerReview: Symbol.for("SubmitOwnerReplyToCustomerReviewUseCase"),
  },
  service: {
    moderationPolicy: Symbol.for("ReviewModerationPolicy"),
    validationService: Symbol.for("ReviewValidationService"),
    reviewMapper: Symbol.for("ReviewMapper"),
    moderationService: Symbol.for("ReviewModerationService"),
  },
  infrastructure: {
    mongooseModel: Symbol.for("ReviewMongooseModel"),
  },
};