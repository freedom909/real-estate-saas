import { injectable, inject } from "tsyringe";
import { TOKENS_USER } from "@/modules/tokens/user.tokens";
import UserRepository from "../../../subgraphs/user/repos/user.repo";


/**
 * UserAdapter acts as an Anti-Corruption Layer (ACL).
 * It prevents the Tenant context from leaking User implementation details.
 */
@injectable()
export class UserAdapter {
  constructor(
    @inject(TOKENS_USER.repos.userRepo) private userRepo: UserRepository
  ) {}

  async getUserById(id: string) {
    // This implementation uses the Repo directly because of the monorepo structure,
    // but provides a clean boundary for the TenantService.
    // In a distributed system, this would call the User subgraph via GraphQL/SDK.
    const user = await this.userRepo.findById(id);
    if (!user) return null;

    // Map to a clean object to truly act as an ACL
    // This prevents TenantService from depending on User model specifics (like _id)
    return { id: user._id.toString(), email: user.email };
  }
}