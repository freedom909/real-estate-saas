import mongoose, { Schema, Document } from "mongoose"

export interface HostDocument extends Document {

  name: string

  slug: string

  createdAt: Date
}

const hostSchema = new Schema<HostDocument>(
  {
    name: {
      type: String,
      required: true
    },

    slug: {
      type: String,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<HostDocument>(
  "Host",
  hostSchema
)