// models/Credential.ts
import mongoose from "mongoose";

interface ICredential {
  userId: mongoose.Types.ObjectId;
  provider:  "GOOGLE" | "GITHUB" | "FACEBOOK" | "APPLE" | "LINE";
  providerAccountId: string;
  email?: string;
  emailVerified?: boolean;
  profile?: {
    name?: string;
    avatar?: string;
  };
  secret?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CredentialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    provider: {
      type: String,
      enum: [
        "PASSWORD",
        "GOOGLE",
        "GITHUB",
        "FACEBOOK",
        "APPLE",
        "LINE",
      ],
      required: true,
      index: true,
    },

    providerAccountId: {
      type: String,
      required: true,
    },

    email: {
      type: String,
    },

    emailVerified: {
      type: Boolean,
    },

    profile: {
      name: String,
      avatar: String,
    },

    secret: {
      type: String, // password hash / oauth refresh token
      select: false,
    },

    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 🚨 核心唯一索引
CredentialSchema.index(
  { provider: 1, providerAccountId: 1 },
  { unique: true }
);

export default mongoose.model<ICredential>("Credential", CredentialSchema);