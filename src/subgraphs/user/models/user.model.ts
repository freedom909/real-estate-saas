// user.model.ts

import { IProfile } from "@/core/user/domain/entities/user";
import { UserRole } from "@/core/user/domain/userRole";
import mongoose, { HydratedDocument, Types } from "mongoose";

export type UserDocument = HydratedDocument<IUserDB>;
export interface IUserDB {
  _id: Types.ObjectId;
  email: string; // Mongoose schema requires it, so it's a string
  name: string;
  picture: string;
  role: UserRole;
  status: "ACTIVE" | "SUSPENDED" | "BANNED" | "DELETED"; // Aligned with Mongoose enum
  tokenVersion: number; // Corrected type from schema definition to actual type
  createdAt: Date;
  updatedAt: Date;
  profile?: IProfile;
}

const userSchema = new mongoose.Schema({
  email: {
  type: String,
  required: true,
  lowercase: true,
  trim: true,
  },
  
  name: { type: String, required: true },
  picture: { type: String, default: "" },
  status: { type: String, enum: ["ACTIVE", "SUSPENDED", "BANNED","DELETED"], default: "ACTIVE" },
  tokenVersion: {
    type: Number,
    required: true,
    default: 0,
  },

}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret: any) => {
      ret.id = ret._id.toString(); // Map _id to id ??
      delete ret._id; // Remove _id
      delete ret.__v; // Remove __v (version key)
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret: any) => {
      ret.id = ret._id.toString();
      delete ret.__v;
      return ret;
    },
  },
});
userSchema.index({ email: 1 })

const UserModel = (mongoose.models.User as mongoose.Model<IUserDB>)  || mongoose.model<IUserDB>("User", userSchema);
export default UserModel;  // ✅ 确保默认导出