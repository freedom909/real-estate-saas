import { injectable } from "tsyringe";
import mongoose from "mongoose";
import { ReviewModel } from "../models/ReviewModel";
import { IReviewRepository } from "../../IReviewRepository";
import { Review } from "../../domain/entities/Review";
import { ReviewMapper } from "../models/ReviewMapper";
import { where } from "sequelize";

@injectable()
export class ReviewRepository implements IReviewRepository {
 async findByBookingId(bookingId: string): Promise<Review | null> {
    const doc = await ReviewModel.findOne(where);
    return doc ? ReviewMapper.toDomain(doc) : null;
    
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

  async update(review: Review): Promise<void> {
    await ReviewModel.findByIdAndUpdate(review.props.id, ReviewMapper.toPersistence(review));
  }


  async delete(id: string): Promise<void> {
    await ReviewModel.findByIdAndDelete(id);
  }
}