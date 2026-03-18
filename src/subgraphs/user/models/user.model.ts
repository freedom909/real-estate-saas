// user.model.ts
import mongoose, { HydratedDocument, Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { Role } from "../../../domain/user/types/role";
import { IProfile } from "../../../domain/user/types/user";

export type UserDocument = HydratedDocument<IUserDB>;

export interface IUserDB {
  _id: Types.ObjectId;
  email: string;
  name: string;
  avatar: string;
  role: Role;
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  tokenVersion: {type:number; default:0}
  createdAt: Date;
  updatedAt: Date;
  profile?: IProfile;
  id?: Types.ObjectId;
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
}, { timestamps: true });
userSchema.index({ email: 1 })

const UserModel = mongoose.models.User || mongoose.model<IUserDB>("User", userSchema);
export default UserModel;  // ✅ 确保默认导出