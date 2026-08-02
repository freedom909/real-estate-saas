//src/subgraphs/user/models/profile.models.ts
import mongoose from "mongoose"
const { Schema } = mongoose

const profileSchema = new Schema({
    userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
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
)
const ProfileModel = mongoose.model("Profile", profileSchema)
export default ProfileModel