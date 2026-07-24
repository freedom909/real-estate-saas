// src/core/admin/application/usecase/createAdminUser.usecase.ts

import { injectable, inject } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { IAdminUserRepository } from "../../domain/entities/IAdminUserRepository";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";

export interface CreateAdminUserInput {
  email: string;
  name: string;
  role?: string;
  avatar?: string;
}

@injectable()
export default class CreateAdminUserUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.adminUserRepository)
    private adminRepo: IAdminUserRepository
  ) {}

  async execute(input: CreateAdminUserInput) {
    const id = uuidv4();
    const now = new Date();

    const admin = {
      id,
      email: input.email,
      name: input.name,
      role: input.role || "ADMIN",
      avatar: input.avatar,
      isActive: true,
      immutable: false,
      lastLoginAt: undefined,
      createdAt: now,
      updatedAt: now,
    };

    return this.adminRepo.create(admin as any);
  }
}
