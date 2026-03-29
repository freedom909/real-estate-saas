
import UserService from "./user.service";
import { ForbiddenError } from "@/infrastructure/utils/errors";
import { Action, Resource } from "@/domain/user/types/types";
import PolicyEngine from "@/rbac/policy.engine";

class GetUserUseCase {
  constructor(
    private userService: UserService,
    private policy: PolicyEngine
  ) {}

  async execute({ requester, targetUserId }) {
    // 👉 可提前判断（优化）
    if (!requester) throw new ForbiddenError(targetUserId);

    const user = await this.userService.findById(targetUserId);
    if (!user) return null;

    const allowed = this.policy.can(
      Action.READ,
      Resource.USER,
      {
        user: requester,
        resourceOwnerId: user.id,
      }
    );

    if (!allowed) {
      throw new ForbiddenError(targetUserId);
    }
    return user;
  }
}