import mongoose, { Schema } from "mongoose";

const ReviewSchema = new Schema({
  bookingId: { type: String, required: true, unique: true, index: true },
  listingId: { type: String, required: true, index: true },
  customerId: { type: String, required: true, index: true },
  hostId: { type: String, required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  content: { type: String, required: true },
  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED", "FLAGGED"], default: "PENDING", index: true },
  replies: [{
    authorId: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  reports: [{
    reporterId: String,
    reason: String,
    status: { type: String, default: "OPEN" },
    createdAt: { type: Date, default: Date.now }
  }],
  aiMetadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export const ReviewModel = mongoose.model("Review", ReviewSchema);