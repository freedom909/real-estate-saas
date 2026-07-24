// src/core/admin/application/usecase/deleteAdminUser.usecase.ts

import { injectable, inject } from "tsyringe";
import { IAdminUserRepository } from "../../domain/entities/IAdminUserRepository";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";
import { AdminRole } from "../../domain/entities/adminRole";

@injectable()
export default class DeleteAdminUserUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.adminUserRepository)
    private adminRepo: IAdminUserRepository
  ) {}

async execute(id: string): Promise<boolean> {

    const admin = await this.adminRepo.findById(id);

    if (!admin) {
        throw new Error("Admin not found");
    }

    // Business Rule ①
    if (admin.immutable) { // Property 'immutable' does not exist on type 'AdminUser'.
        throw new Error("System account cannot be deleted.");
    }

    // Business Rule ②
    if (admin.role === "SUPER_ADMIN") {
      // Property 'countByRole' does not exist on type 'IAdminUserRepository'.
        const count = await this.adminRepo.countByRole(AdminRole.SUPER_ADMIN);
        if (count <= 1) {
            throw new Error(
                "Cannot delete the last Super Admin."
            );
        }
    }

    return this.adminRepo.delete(id);
}
}
