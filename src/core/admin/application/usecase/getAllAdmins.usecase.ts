import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";
import { inject, injectable } from "tsyringe";
import { IAdminUserRepository } from "../../domain/entities/IAdminUserRepository";
import { AdminUser } from "../../domain/entities/adminUser";
import { AdminUserMapper } from "../../infrastructure/mappers/adminUser.mapper";

@injectable()
export default class GetAllAdminsUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.adminUserRepository)
    private readonly repo: IAdminUserRepository
  ) {}

  async execute(): Promise<AdminUser[]> {
    console.log("========== GET ALL ADMINS ==========");
    const admins = await this.repo.findAll();
    console.log("admins useCase =", admins);
    return admins.map((a) => AdminUserMapper.toDomain(a));
  }
}
