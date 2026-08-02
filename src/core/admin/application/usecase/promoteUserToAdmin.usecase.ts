//PromoteUserToTenantAdmin.usecase.ts

import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";
import { inject } from "tsyringe";
import { IAdminUserRepository } from "../../domain/entities/IAdminUserRepository";
import { IUserRepository } from "@/subgraphs/user/domain/entities/IRepo";
import { TOKENS_USER } from "@/modules/tokens/user.tokens";
import { Role } from "@/core/shared/domain/role";

import { AdminUser } from "../../domain/entities/adminUser";
import { IUser } from "@/core/user/domain/user";

export default class PromoteUserToAdminUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.adminUserRepository)
    private readonly repoRepository: IAdminUserRepository,
    @inject(TOKENS_USER.repos.userRepo)
    private readonly userRepository: IUserRepository
  ) {}
  
  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    await this.userRepository.setUserRole(userId,Role.ADMIN);
    const admin = AdminUser.fromUser(user as unknown as IUser);
    await this.repoRepository.createAdmin(admin as unknown as IUser);
  }
}