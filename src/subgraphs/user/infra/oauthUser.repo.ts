// create.oauthUser.repo.ts

import { CreateOAuthUserInput, IUserRepository } from "../domain/entities/IRepo";
import UserModel from "../models/user.model";

export default class CreateOAuthRepository implements IUserRepository {
  async createOAuthUser(
    input: CreateOAuthUserInput
  ): Promise<InstanceType<typeof UserModel>> {
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