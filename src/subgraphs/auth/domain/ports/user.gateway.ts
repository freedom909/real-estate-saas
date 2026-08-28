// auth/domain/ports/user.gateway.ts

import { UserDTO } from "../../application/dto/user.dto";
import { OAuthProfile } from "../services/oauthProvider.interface";

export interface IUserGateway {
  findById(userId: string): Promise<UserDTO | null>;// how to define the 'UseDTO'
  findByEmail(email: string): Promise<UserDTO | null>;
  createFromOAuth(profile: OAuthProfile): Promise<UserDTO>;
}