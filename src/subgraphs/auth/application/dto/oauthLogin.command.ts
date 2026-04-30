//src/subgraphs/auth/application/dto/oauthLogin.command.ts

export interface OAuthLoginCommand {
  provider: string;
  idToken: string;


  request: {
    ip: string;
    userAgent: string;
    deviceId: string;
  }
}