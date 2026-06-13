import { Rating } from "../services/rating";
import { Review, ReviewStatus } from "../services/review";


export class ReviewMapper {
  static toDomain(raw: any): Review {
    return new Review({
      id: raw._id.toString(),
      bookingId: raw.bookingId,
      listingId: raw.listingId,
      guestId: raw.guestId,
      hostId: raw.hostId,
      rating: new Rating(raw.rating),
      content: raw.content,
      status: raw.status as ReviewStatus,
      replies: raw.replies || [],
      reports: raw.reports || [],
      aiMetadata: raw.aiMetadata || {},
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(domain: Review): any {
    return {
      bookingId: domain.props.bookingId,
      listingId: domain.props.listingId,
      guestId: domain.props.guestId,
      hostId: domain.props.hostId,
      rating: domain.props.rating.value,
      content: domain.props.content,
      status: domain.props.status,
      replies: domain.props.replies?.map(r => ({
        authorId: r.props.authorId,
        content: r.props.content,
        createdAt: r.props.createdAt
      })),
      aiMetadata: domain.props.aiMetadata,
    };
  }
}