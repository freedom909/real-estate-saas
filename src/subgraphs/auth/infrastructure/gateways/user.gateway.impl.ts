// auth/infrastructure/gateways/user.gateway.impl.ts

import { inject, injectable } from "tsyringe";
import { IUserGateway } from "../../domain/ports/user.gateway";
import { TOKENS_USER } from "@/modules/tokens/user.tokens";
import { UserClient } from "@/packages/user-sdk/src";
import { OAuthProfile } from "../../domain/services/oauthProvider.interface";

@injectable()
export class UserGateway implements IUserGateway {
  constructor(
    @inject(TOKENS_USER.userClient)
    private client: UserClient
  ) {}

  async findByEmail(email: string) {
    return this.client.findByEmail(email);
  }

  async findById(userId: string) {
    return this.client.findById(userId);
  }


  async createFromOAuth(profile: OAuthProfile) {
    return this.client.createUserFromOAuth(profile);
  }
}