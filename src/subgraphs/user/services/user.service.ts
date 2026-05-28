import { injectable, inject } from "tsyringe";
import { normalizeRole } from "../../../domain/user/types/role";
import { TOKENS_USER} from "../../../modules/tokens/user.tokens.js";

interface User {
  id: string;
  role: string;
  [key: string]: any;
}

interface UserRepository {
  findById(id: string): Promise<User | null>;
  userByEmail(email: string): Promise<User | null>;
}

@injectable()
class UserService {
  deactivate(userId: string) {
    throw new Error("Method not implemented.");
  }

  userRepository: any;
  constructor(
    @inject(TOKENS_USER.repos.userRepo)
    userRepository: UserRepository
  ) {
    this.userRepository = userRepository;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;

    user.role = normalizeRole(user.role);
    return user;
  }

  async userByEmail(email: string): Promise<User | null> {
    console.log("email++",email)
     const user = await this.userRepository.userByEmail(email);
     if(!user) return null
     
    console.log(JSON.stringify(user, null, 2))
    return {
  id: user._id.toString(),
  ...user
};
  }
}

export default UserService;