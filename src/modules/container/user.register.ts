import { container } from "tsyringe";
import { TOKENS_USER } from "../tokens/user.tokens";
import CreateOAuthUserUseCase from "@/subgraphs/user/application/usecase/createOAuthUserUseCase";
import CreateOAuthRepository from "@/subgraphs/user/infra/oauthUser.repo";

export default function userRegister(){
    container.register(TOKENS_USER.repos.createOAuthRepository,{ useClass: CreateOAuthRepository}); 
    container.register(TOKENS_USER.usecase.createOAuthUserUseCase,{ useClass: CreateOAuthUserUseCase}); 
}