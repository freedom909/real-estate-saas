export const TOKENS_REVIEW = {
  repository: {
    reviewRepository: Symbol.for("ReviewRepository"),
  },
  usecase: {
    submitGuestReview: Symbol.for("SubmitGuestReviewUseCase"),
    updateReview: Symbol.for("UpdateReviewUseCase"),
    deleteReview: Symbol.for("DeleteReviewUseCase"),
    replyToReview: Symbol.for("ReplyToReviewUseCase"),
    reportReview: Symbol.for("ReportReviewUseCase"),
    getListingReviews: Symbol.for("GetListingReviewsUseCase"),
    getHostReviews: Symbol.for("GetHostReviewsUseCase"),
    submitHostReplyToGuestReview: Symbol.for("SubmitHostReplyToGuestReviewUseCase"),
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