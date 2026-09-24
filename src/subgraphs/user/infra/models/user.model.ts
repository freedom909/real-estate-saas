// src/subgraphs/user/infra/models/user.model.ts

// user.model.ts

import { IProfile } from "@/core/user/domain/user";
import { GlobalRole } from "@/core/shared/domain/role";
import mongoose, { HydratedDocument, Types } from "mongoose";

export type UserDocument = HydratedDocument<IUserDB>;

export interface IUserDB {
  _id: Types.ObjectId;
  email: string;
  name: string;
  isActive: boolean;
  picture: string;

  /**
   * Platform-level role.
   *
   * Tenant-level roles such as HOST / AGENT / OWNER
   * belong to Membership.role instead.
   */
  globalRole: GlobalRole;

  status: "ACTIVE" | "SUSPENDED" | "BANNED" | "DELETED";
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
  profile?: IProfile;
}

const userSchema = new mongoose.Schema<IUserDB>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    globalRole: {
      type: String,
      enum: Object.values(GlobalRole),
      default: GlobalRole.CUSTOMER,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    picture: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "BANNED", "DELETED"],
      default: "ACTIVE",
    },

    tokenVersion: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,
      transform: (doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
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
  }
);

userSchema.index({ email: 1 });

const UserModel =
  (mongoose.models.User as mongoose.Model<IUserDB>) ||
  mongoose.model<IUserDB>("User", userSchema);

export default UserModel;