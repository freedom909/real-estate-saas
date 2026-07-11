
import UserModel from "@/subgraphs/user/models/user.model";

export interface IUserRepository {
    createOAuthUser(input: CreateOAuthUserInput): Promise<typeof UserModel>;
    deactivate(userId: string): Promise<boolean>;
    activate(userId: string): Promise<boolean>;
}


export interface CreateOAuthUserInput {

email: string;

name?: string;

picture?: string;

provider: string;

}