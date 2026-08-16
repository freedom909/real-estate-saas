// src/subgraphs/user/application/usecase/becomeHost.usecase.ts

import { inject, injectable } from "tsyringe";

import { TOKENS_USER } from "@/modules/tokens/user.tokens";

import { IUserRepository } from "../../domain/repository/IUserRepository";

import { UserEntity } from "../../domain/entities/user.entity";
import { UserRole } from "@/core/user/domain/userRole";

@injectable()
export class BecomeHostUseCase {
  constructor(
    @inject(TOKENS_USER.repos.userRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<UserEntity> {
     console.log("[BecomeHost] searching user:", userId);
    const user = await this.userRepository.findById(userId);
  
   console.log("[BecomeHost] found user:", user);
    if (!user) {
      throw new Error("User not found");
    }

    user.becomeHost();

    await this.userRepository.save(user);

    return user;
  }
}