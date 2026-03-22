import { injectable } from "tsyringe";

//
@injectable()
export default class AuthService {
  static bindOAuthAccount(userId: any, provider: any, idToken: any) {
    throw new Error("Method not implemented.");
  }
  [x: string]: any;
    
  constructor(
    private sessionRepo: any,
    private refreshTokenRepo: any,
    private userClient: any
  ) {}

  async getMySessions(userId: string) {
    return this.sessionRepo.listByUser(userId);
  }

  async revokeSession(userId: string, sessionId: string, token?: string) {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found or unauthorized");
    }

    await this.refreshTokenRepo.revokeBySession(sessionId);
    await this.sessionRepo.revoke(sessionId);

    return true;
  }

async bindOAuthAccount(userId, provider, idToken) {
  // verify token
  // check provider conflict
  // check already bound
  // save
}

  async unbindOAuthAccount(userId: string, provider: string, context: { ip: string; deviceId: string }) {
    // Logic to remove OAuth link from user profile via userClient
    return this.userClient.removeOAuthProvider(userId, provider);
  }

}