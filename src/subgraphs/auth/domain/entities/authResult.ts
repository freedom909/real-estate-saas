//src/subgraphs/auth/domain/entities/authResult.ts

import { AuthUserResponseDTO } from "../../application/dto/auth-user.response";

export type AuthResult =
  | {
      status: "SUCCESS";
      accessToken: string;
      refreshToken: string;
      user: AuthUserResponseDTO;
    }
  | {
      status: "CHALLENGE";
      challengeId: string;
    }
  | {
      status: "BLOCKED";
    };