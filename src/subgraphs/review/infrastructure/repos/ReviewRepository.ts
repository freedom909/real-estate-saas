import { injectable } from "tsyringe";
import { IReviewRepository } from "../../../domain/repositories/IReviewRepository";
import { Review } from "../../../domain/entities/Review";
import { ReviewModel } from "./models/ReviewModel";
import { ReviewMapper } from "../mappers/ReviewMapper";

@injectable()
export class ReviewRepositoryImpl implements IReviewRepository {
  async findById(id: string): Promise<Review | null> {
    const doc = await ReviewModel.findById(id);
    return doc ? ReviewMapper.toDomain(doc) : null;
  }

  async save(review: Review): Promise<Review> {
    const persistence = ReviewMapper.toPersistence(review);
    const doc = await ReviewModel.findByIdAndUpdate(
      review.props.id || new mongoose.Types.ObjectId(),
      persistence,
      { upsert: true, new: true }
    );
    return ReviewMapper.toDomain(doc);
  }

  async findByListingId(listingId: string): Promise<Review[]> {
    const docs = await ReviewModel.find({ listingId });
    return docs.map(ReviewMapper.toDomain);
  }

  async findByHostId(hostId: string): Promise<Review[]> {
    const docs = await ReviewModel.find({ hostId });
    return docs.map(ReviewMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await ReviewModel.findByIdAndDelete(id);
  }
}