
import { UserRole } from "@/core/user/domain/userRole";
import UserModel, { IUserDB } from "@/subgraphs/user/infra/models/user.model";


export interface IUserRepository {  
    setUserRole(userId: string, role: UserRole): Promise<void>;
    findById(userId: string): Promise<IUserDB>;  
    createOAuthUser(input: CreateOAuthUserInput): Promise<IUserDB>;
    deactivate(userId: string): Promise<boolean>;
    activate(userId: string): Promise<boolean>;
}


export interface CreateOAuthUserInput {

email: string;
role: UserRole; // it is not role but UserRole?
name: string;

picture?: string;

provider: string;

}