// createOAuthUserUseCase.ts

import { TOKENS_USER } from "@/modules/tokens/user.tokens";
import { inject, injectable } from "tsyringe";

import { CreateOAuthUserInput, IUserRepository } from "@/subgraphs/user/domain/entities/IRepo";

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
        @inject(TOKENS_USER.repos.createOAuthRepository)
        private repository: IUserRepository
    ) {}
async execute(input: GraphQLOAuthInput) {
  console.log("UseCase received:", input);

  const payload: CreateOAuthUserInput = {
    email: input.email,
    name: input.profile.name,
    picture: input.profile.avatar ?? "",
    provider: input.provider,
  };

  console.log("Payload to repo:", payload);
        return this.repository.createOAuthUser(payload);
     }
}

