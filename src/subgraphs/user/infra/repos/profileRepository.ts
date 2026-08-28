import mongoose from "mongoose";

import { Profile } from "../../domain/entities/profile";
import { IProfileRepository } from "../../domain/repository/IProfileRepository";

import ProfileModel from "../models/profile.model";

export class ProfileRepository implements IProfileRepository {

  async findByUserId(
    userId: string
  ): Promise<Profile | null> {

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    const doc = await ProfileModel
      .findOne({
        userId: new mongoose.Types.ObjectId(userId),
      })
      .lean();

    if (!doc) {
      return null;
    }

    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),

      email: doc.email,
      name: doc.name,
      avatar: doc.avatar,

      phone: doc.phone,
      address: doc.address,

      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}