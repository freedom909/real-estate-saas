import mongoose, { Schema, Model } from "mongoose";

export interface ProfileDocument {
  userId: mongoose.Types.ObjectId;
  email?: string;
  name?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const profileSchema = new Schema<ProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: false,
    },

    name: {
      type: String,
      required: false,
    },

    avatar: {
      type: String,
      required: false,
    },

    phone: {
      type: String,
      required: false,
    },

    address: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const ProfileModel: Model<ProfileDocument> =
  (mongoose.models.Profile as Model<ProfileDocument>) ||
  mongoose.model<ProfileDocument>("Profile", profileSchema);

export default ProfileModel;