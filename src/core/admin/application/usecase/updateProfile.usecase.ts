// src/core/admin/application/usecase/updateProfile.usecase.ts

import { injectable, inject } from "tsyringe";
import { IAdminUserRepository } from "../../domain/entities/IAdminUserRepository";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";

export interface UpdateProfileInput {
  name?: string;
  avatar?: string;
}

@injectable()
export default class UpdateProfileUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.adminUserRepository)
    private adminRepo: IAdminUserRepository
  ) {}

  async execute(adminId: string, input: UpdateProfileInput) {
    const admin = await this.adminRepo.findById(adminId);
    if (!admin) throw new Error("Admin not found");

    if (input.name) admin.updateName(input.name);
    if (input.avatar !== undefined) (admin as any).props.avatar = input.avatar;

    await this.adminRepo.update(adminId, admin);

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      avatar: (admin as any).avatar,
      isActive: admin.isActive,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }
}
