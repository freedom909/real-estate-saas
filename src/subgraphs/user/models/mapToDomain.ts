import { IUser, IProfile } from "@/domain/user/types/user";
import { IUserDB } from "../models/user.model";

export function mapToDomain(user: IUserDB): IUser {
  return {
    id: user._id.toString(),
    profile: {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    },
    role: user.role,
    status: user.status,
    tokenVersion: user.tokenVersion,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}