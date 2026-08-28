//src/subgraphs/auth/application/dto/oauthLogin.command.ts

import {
  OAuthCredential,
} from "../../domain/services/oauthProvider.interface";

export interface OAuthLoginCommand {
  provider: string;
  credential: OAuthCredential;

  request?: {
    ip?: string;
    userAgent?: string;
    deviceId?: string;
  };
}