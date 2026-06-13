import { injectable } from "tsyringe";
import { IReviewRepository } from "../../domain/entities/repos/IReviewRepository";
import { Review } from "../services/review";
import { ReviewModel } from "../models/ReviewModel";
import { ReviewMapper } from "../models/ReviewMapper";
import mongoose from "mongoose";


@injectable()
export class ReviewRepositoryImpl implements IReviewRepository {
  findByBookingId(bookingId: string): Promise<Review | null> {
    throw new Error("Method not implemented.");
  }
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