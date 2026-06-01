import { Rating } from "../value-objects/Rating";
import { ReviewReply } from "./ReviewReply";
import { ReviewReport } from "./ReviewReport";

export enum ReviewStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  FLAGGED = "FLAGGED"
}

export interface ReviewProps {
  id?: string;
  bookingId: string;
  listingId: string;
  guestId: string;
  hostId: string;
  rating: Rating;
  content: string;
  status: ReviewStatus;
  replies?: ReviewReply[];
  reports?: ReviewReport[];
  aiMetadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Review {
  constructor(public readonly props: ReviewProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.content || this.props.content.trim().length === 0) {
      throw new Error("Review content cannot be empty");
    }
  }
}