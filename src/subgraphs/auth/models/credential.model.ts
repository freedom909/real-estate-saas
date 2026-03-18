import mongoose, { Schema, Document } from "mongoose"

export interface CredentialDocument extends Document {

  userId: mongoose.Types.ObjectId

  provider: "PASSWORD" | "GOOGLE" | "APPLE" | "GITHUB" | "FACEBOOK" | "LINE"

  providerUserId: string

  passwordHash?: string

  createdAt: Date
}

const credentialSchema = new Schema<CredentialDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },

    provider: {
      type: String,
      enum: ["PASSWORD", "GOOGLE", "APPLE", "GITHUB", "FACEBOOK", "LINE"],
      required: true
    },

    providerUserId: {
      type: String,
      required: true
    },

    passwordHash: {
      type: String
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
)

export default mongoose.model<CredentialDocument>(
  "Credential",
  credentialSchema
)