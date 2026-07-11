import { injectable, inject } from "tsyringe";
import { TOKENS_USER} from "../../../modules/tokens/user.tokens";
import { normalizeRole } from "@/core/user/domain/entities/normalize.role";
import { UserResponse } from "./user.dto";

type User = {
  id: string;
  
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

  async findById(id: string): Promise<UserResponse | null> {
    // If id looks like an email, look up by email instead of _id
    const user = id.includes("@")
      ? await this.userRepository.userByEmail(id)
      : await this.userRepository.findById(id);
    if (!user) return null;
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      tokenVersion: user.tokenVersion,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
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
