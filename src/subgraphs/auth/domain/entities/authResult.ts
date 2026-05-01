//src/subgraphs/auth/domain/entities/authResult.ts

export type AuthResult =
  | {
      status: "SUCCESS";
      accessToken: string;
      refreshToken: string;
    }
  | {
      status: "CHALLENGE";
      challengeId: string;
    }
  | {
      status: "BLOCKED";
    };