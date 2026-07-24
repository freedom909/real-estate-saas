import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";
import { inject } from "tsyringe";
import { IAdminUserRepository } from "../../domain/entities/IAdminUserRepository";

export default class DemoteAdminToUserUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.adminUserRepository)
    private readonly repo: IAdminUserRepository
  ) {}

  async execute(userId: string): Promise<void> {
    await this.repo.demoteAdminToUser(userId);
  }
}
