import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  id: String,
  listingId: String,
  guestId: String,
  checkInDate: Date,
  checkOutDate: Date,
  totalCost: Number,
  status: String,
  createdAt: Date,
});

export const BookingModel = mongoose.model("Booking", BookingSchema);