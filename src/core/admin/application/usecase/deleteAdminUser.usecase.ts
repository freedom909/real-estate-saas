// src/core/admin/application/usecase/deleteAdminUser.usecase.ts

import { injectable, inject } from "tsyringe";
import { IAdminUserRepository } from "../../domain/entities/IAdminUserRepository";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";

@injectable()
export default class DeleteAdminUserUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.adminUserRepository)
    private adminRepo: IAdminUserRepository
  ) {}

  async execute(id: string): Promise<boolean> {
    const admin = await this.adminRepo.findById(id);
    if (!admin) throw new Error("Admin not found");

    return this.adminRepo.delete(id);
  }
}
