// import "reflect-metadata";
import { container } from "tsyringe";
import UserModel from "./user.model.js";
import CredentialModel from "./credential.model.js";
import UserRepo from "../repos/user.repo.js";
import UserService from "../../../application/user/services/user.service.js";
// import UserResolver from "../resolvers/index.js";

// 1. Register Models
container.register("UserModel", { useValue: UserModel });
container.register("CredentialModel", { useValue: CredentialModel });

// 2. Register Repositories
container.registerSingleton(UserRepo);

// 3. Register Services
container.registerSingleton(UserService);

// 4. Register Resolvers
// container.registerSingleton(UserResolver);

export default container;