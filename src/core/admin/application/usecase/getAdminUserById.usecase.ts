// src/core/admin/application/usecase/getAdminUserById.usecase.ts

import { injectable, inject } from "tsyringe";
import { IAdminUserRepository } from "../../domain/entities/IAdminUserRepository";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";

@injectable()
export default class GetAdminUserByIdUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.adminUserRepository)
    private adminRepo: IAdminUserRepository
  ) {}

  async execute(id: string) {
    const admin = await this.adminRepo.findById(id);
    if (!admin) return null;

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      avatar: admin.avatar,
      isActive: admin.isActive,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }
}
