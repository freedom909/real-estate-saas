// src/core/tenant/adapter/user.adapter.ts

import { injectable, inject } from "tsyringe";
import { TOKENS_USER } from "@/modules/tokens/user.tokens";
import { IUserRepository } from "@/subgraphs/user/domain/repository/IUserRepository";

/**
 * UserAdapter acts as an Anti-Corruption Layer (ACL).
 * It prevents the Tenant context from leaking User implementation details.
 */
@injectable()
export class UserAdapter {
  constructor(
    @inject(TOKENS_USER.repos.userRepository)
    private readonly userRepo: IUserRepository,
  ) {}

  async getUserById(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) return null;

    // Map to a clean object to truly act as an ACL
    return { id: user.id, email: user.email };
  }
}
