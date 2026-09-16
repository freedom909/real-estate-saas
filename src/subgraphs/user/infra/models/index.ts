import { container } from "tsyringe";
import UserModel from "./user.model.js";
import CredentialModel from "./credential.model.js";
import { UserRepository } from "../repos/user.repo.js";

// 1. Register Models
container.register("UserModel", { useValue: UserModel });
container.register("CredentialModel", { useValue: CredentialModel });

// 2. Register Repositories
container.registerSingleton(UserRepository);

// 3. Register Services

// 4. Register Resolvers
// container.registerSingleton(UserResolver);

export default container;