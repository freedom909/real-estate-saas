// createOAuthUserUseCase.ts

import { TOKENS_USER } from "@/modules/tokens/user.tokens";
import { inject, injectable } from "tsyringe";

import { CreateOAuthUserInput, IUserRepository } from "@/subgraphs/user/domain/entities/IRepo";



@injectable()
export default class CreateOAuthUserUseCase {
    constructor(
        @inject(TOKENS_USER.repos.createOAuthRepository)
        private repository: IUserRepository
    ) {}

    async execute(input: CreateOAuthUserInput) {
        return this.repository.createOAuthUser(input);
     }
}