// src/modules/container/user.register.ts

import { container } from "tsyringe";
import { TOKENS_USER } from "../tokens/user.tokens";
import { UserRepository } from "@/subgraphs/user/infra/repos/user.repo";
import { BecomeHostUseCase } from "@/subgraphs/user/application/usecase/becomeHost.usecase";
import CreateOAuthUserUseCase from "@/subgraphs/user/application/usecase/createOAuthUserUseCase";

/**
 * Registers user subgraph dependencies at the module level.
 * Called once at startup (from user/index.ts).
 */
export default function userRegister() {
  // Single DDD repository — all consumers use this token
  container.register(TOKENS_USER.repos.userRepository, { useClass: UserRepository });

  // Use Cases
  container.register(TOKENS_USER.usecase.becomeHostUseCase, { useClass: BecomeHostUseCase });
  container.register(TOKENS_USER.usecase.createOAuthUserUseCase, { useClass: CreateOAuthUserUseCase });
}
