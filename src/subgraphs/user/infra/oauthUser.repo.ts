// create.oauthUser.repo.ts

import { Role } from "@/core/shared/domain/role";
import { CreateOAuthUserInput, IUserRepository } from "../domain/entities/IRepo";
import UserModel, { IUserDB } from "./models/user.model";

export default class CreateOAuthRepository implements IUserRepository {
  async setUserRole(userId: string, role: Role): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { role });
  }
  async findById(userId: string): Promise<IUserDB> {
    return await UserModel.findById(userId);
  }

  async createOAuthUser( input: CreateOAuthUserInput): Promise<IUserDB> {
    return await UserModel.create({
      email: input.email,
      name: input.name,
      picture: input.picture ?? "",
    });
  }

async deactivate(userId: string): Promise<boolean> {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { status: "SUSPENDED" },
    { new: true }
  );

  return !!user;
}

async activate(userId: string): Promise<boolean> {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { status: "ACTIVE" },
    { new: true }
  );

  return !!user;
}
}