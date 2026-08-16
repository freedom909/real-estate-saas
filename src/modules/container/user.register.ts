import { container } from "tsyringe";
import { TOKENS_USER } from "../tokens/user.tokens";
import CreateOAuthUserUseCase from "@/subgraphs/user/application/usecase/createOAuthUserUseCase";
import CreateOAuthRepository from "@/subgraphs/user/infra/oauthUser.repo";
import { BecomeHostUseCase } from "@/subgraphs/user/application/usecase/becomeHost.usecase";
import UserRepository from "@/subgraphs/user/infra/repos/user.repo";

export default function userRegister(){
    container.register(TOKENS_USER.repos.createOAuthRepository,{ useClass: CreateOAuthRepository}); 
    container.register(TOKENS_USER.usecase.createOAuthUserUseCase,{ useClass: CreateOAuthUserUseCase});
    container.register(TOKENS_USER.usecase.becomeHostUseCase,{ useClass: BecomeHostUseCase});
    container.register(TOKENS_USER.repos.userRepository,{ useClass: UserRepository});
}