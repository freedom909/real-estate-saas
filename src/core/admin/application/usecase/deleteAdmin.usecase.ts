import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";
import { inject } from "tsyringe";
import { IAdminUserRepository } from "../../domain/entities/IAdminUserRepository";

export default class DeleteAdminUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.adminUserRepository)
    private readonly repo: IAdminUserRepository
  ) {}

  async execute(userId: string): Promise<boolean> {
    return this.repo.delete(userId);
  }
}
