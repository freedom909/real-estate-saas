import "reflect-metadata";

import { injectable } from "tsyringe";
import jwt, { JwtPayload } from "jsonwebtoken";

import { TokenPayload } from "../../domain/entities/token-payload";

@injectable()
export class JwtService {
  /**
   * Verify JWT signature and return payload
   */
  public verify(token: string): TokenPayload {
    return jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as TokenPayload;
  }

  /**
   * Generate Access Token
   */
  public async signAccessToken(
    payload: TokenPayload
  ): Promise<string> {
    return jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: "1115m",
      }
    );
  }

  /**
   * Generate Refresh Token
   */
  public async signRefreshToken(
    payload: TokenPayload
  ): Promise<string> {
    return jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: "7d",
      }
    );
  }

  /**
   * Decode JWT without verifying signature.
   * Useful for debugging and logging.
   */
  public decode(
    token: string
  ): TokenPayload | JwtPayload | null {
    return jwt.decode(token) as
      | TokenPayload
      | JwtPayload
      | null;
  }

  /**
   * Check whether token is expired.
   */
  public isExpired(token: string): boolean {
    try {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
      return false;
    } catch (err: any) {
      return err.name === "TokenExpiredError";
    }
  }
}