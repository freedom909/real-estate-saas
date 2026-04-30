// user.model.ts
import mongoose, { HydratedDocument, Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../domain/user/types/role";
import { IProfile } from "../../../domain/user/types/user";

export type UserDocument = HydratedDocument<IUserDB>;

export interface IUserDB {
  _id: Types.ObjectId;
  id: string; // Virtual ID for GraphQL
  email: string; // Mongoose schema requires it, so it's a string
  name: string;
  avatar: string;
  role: Role;
  status: "ACTIVE" | "SUSPENDED" | "BANNED" | "DELETED"; // Aligned with Mongoose enum
  tokenVersion: number; // Corrected type from schema definition to actual type
  createdAt: Date;
  updatedAt: Date;
  profile?: IProfile;
}


const userSchema = new mongoose.Schema({
  _id: { type: Types.ObjectId, default: () => new Types.ObjectId() },
 
  email: {
  type: String,
  required: true,
  lowercase: true,
  trim: true,
  },
  
  name: { type: String, required: true },
  avatar: { type: String, default: "" },
  status: { type: String, enum: ["ACTIVE", "SUSPENDED", "BANNED","DELETED"], default: "ACTIVE" },
  tokenVersion: {
    type: Number,
    required: true,
    default: 0,
  },
  // Add profile field to Mongoose schema if it's part of the data model
  // profile: {
  //   name: { type: String },
  //   avatar: { type: String },
  //   email: { type: String },
  //   status: { type: String, enum: ["ACTIVE", "SUSPENDED", "BANNED", "DELETED"] },
  // },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString(); // Map _id to id
      delete ret._id; // Remove _id
      delete ret.__v; // Remove __v (version key)
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret.__v;
      return ret;
    },
  },
});
userSchema.index({ email: 1 })

const UserModel = mongoose.models.User || mongoose.model<IUserDB>("User", userSchema);
export default UserModel;  // ✅ 确保默认导出