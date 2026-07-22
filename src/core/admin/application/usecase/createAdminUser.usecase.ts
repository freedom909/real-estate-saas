// src/core/admin/application/usecase/createAdminUser.usecase.ts

import { injectable, inject } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { AdminUser } from "../../domain/entities/adminUser";
import { IAdminUserRepository } from "../../domain/entities/IAdminUserRepository";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";
import { Email } from "../../domain/value-objects/email";

export interface CreateAdminUserInput {
  id?: string;
  email: string;
  name: string;
  role?: "ADMIN" | "SUPER_ADMIN" | "MODERATOR";
  avatar?: string;
}

@injectable()
export default class CreateAdminUserUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.adminUserRepository)
    private adminRepo: IAdminUserRepository
  ) {}

  async execute(input: CreateAdminUserInput): Promise<AdminUser> {
    const existing = await this.adminRepo.findByEmail(input.email);
    if (existing) {
      throw new Error(`Admin with email ${input.email} already exists`);
    }

    const admin = new AdminUser({
      id: input.id ?? uuidv4(),
      email: new Email(input.email),
      name: input.name,
      role: input.role || "ADMIN",
      avatar: input.avatar,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.adminRepo.create(admin);
  }
}
