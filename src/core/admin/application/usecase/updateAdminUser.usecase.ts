// src/core/admin/application/usecase/updateAdminUser.usecase.ts

import { injectable, inject } from "tsyringe";
import { IAdminUserRepository } from "../../domain/entities/IAdminUserRepository";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";

export interface UpdateAdminUserInput {
  name?: string;
  role?: "ADMIN" | "SUPER_ADMIN" | "MODERATOR";
  avatar?: string;
  isActive?: boolean;
}

@injectable()
export default class UpdateAdminUserUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.adminUserRepository)
    private adminRepo: IAdminUserRepository
  ) {}

  async execute(id: string, input: UpdateAdminUserInput) {
    const admin = await this.adminRepo.findById(id);
    if (!admin) throw new Error("Admin not found");

    if (input.name) admin.updateName(input.name);
    if (input.role) admin.updateRole(input.role);
    if (input.avatar !== undefined) (admin as any).props.avatar = input.avatar;
    if (input.isActive !== undefined) {
      input.isActive ? admin.activate() : admin.deactivate();
    }

    await this.adminRepo.update(id, admin);
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
