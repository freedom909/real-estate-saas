import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";
import { inject } from "tsyringe";
import { IAdminUserRepository } from "../../domain/entities/IAdminUserRepository";
import { AdminUser } from "../../domain/entities/adminUser";

export default class UpdateAdminUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.adminUserRepository)
    private readonly repo: IAdminUserRepository
  ) {}

  async execute(id: string, admin: AdminUser): Promise<boolean> {
    return this.repo.update(id, admin);
  }
}
