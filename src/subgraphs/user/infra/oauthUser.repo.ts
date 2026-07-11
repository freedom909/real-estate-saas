// create.oauthUser.repo.ts

import CreateOAuthUserUseCase from "../application/usecase/createOAuthUserUseCase";
import { CreateOAuthUserInput, IUserRepository } from "../domain/entities/IRepo";
import UserModel from "../models/user.model";

export default class CreateOAuthRepository implements IUserRepository {
    async createOAuthUser(input: CreateOAuthUserInput): Promise<typeof UserModel> {
       return await UserModel.create(input);
    }
    deactivate(userId: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    activate(userId: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
   
}