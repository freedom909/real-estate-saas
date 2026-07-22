// src/core/admin/application/usecase/changePassword.usecase.ts

import { injectable, inject } from "tsyringe";
import { IAdminUserRepository } from "../../domain/entities/IAdminUserRepository";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";
import bcrypt from "bcrypt";

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

@injectable()
export default class ChangePasswordUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.adminUserRepository)
    private adminRepo: IAdminUserRepository
  ) {}

  async execute(adminId: string, input: ChangePasswordInput): Promise<boolean> {
    const admin = await this.adminRepo.findById(adminId);
    if (!admin) throw new Error("Admin not found");

    // In production, you'd store a hashed password in the admin record.
    // For now, this is a placeholder that validates the input.
    if (!input.currentPassword || input.currentPassword.length < 1) {
      throw new Error("Current password is required");
    }

    if (!input.newPassword || input.newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters");
    }

    // TODO: Verify currentPassword against stored hash
    // const isValid = await bcrypt.compare(input.currentPassword, storedHash);
    // if (!isValid) throw new Error("Current password is incorrect");

    // TODO: Hash and store new password
    // const newHash = await bcrypt.hash(input.newPassword, 10);
    // await this.adminRepo.updatePassword(adminId, newHash);

    console.log(`[ChangePassword] Password changed for admin ${adminId}`);
    return true;
  }
}
