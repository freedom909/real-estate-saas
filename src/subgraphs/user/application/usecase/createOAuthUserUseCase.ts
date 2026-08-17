// src/subgraphs/user/application/usecase/createOAuthUserUseCase.ts

import { TOKENS_USER } from "@/modules/tokens/user.tokens";
import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../../domain/repository/IUserRepository";
import { Role } from "@/core/shared/domain/role";

interface GraphQLOAuthInput {
  email: string;
  provider: string;
  profile: {
    name: string;
    avatar?: string;
  };
}

@injectable()
export default class CreateOAuthUserUseCase {
  constructor(
    @inject(TOKENS_USER.repos.userRepository)
    private readonly repository: IUserRepository,
  ) {}

  async execute(input: GraphQLOAuthInput) {
    console.log("🔥🔥🔥 CreateOAuthUserUseCase CALLED");
console.log("🔥 OAuth email =", input.email);
console.log("🔥 OAuth provider =", input.provider);
console.log("🔥 OAuth profile =", input.profile);
    // Check if user already exists
    const existing = await this.repository.findByEmail(input.email);
    if (existing) {
      return existing; // idempotent — return existing user
    }

    return this.repository.create({
      email: input.email,
      name: input.profile.name,
      role: Role.CUSTOMER,
      picture: input.profile.avatar ?? "",
    });
  }
}
