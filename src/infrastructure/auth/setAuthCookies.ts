// src/gateway/cookies/setAuthCookies.ts

import { Response } from "express";
import {
  accessCookieOptions,
  refreshCookieOptions,
} from "../../gateway/cookies/cookieOptions.js";

interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export function setAuthCookies(
  res: Response,
  { accessToken, refreshToken }: AuthTokens
): void {
  if (!accessToken) {
    throw new Error("setAuthCookies: accessToken missing");
  }

  res.cookie(
    "accessToken",
    accessToken,
    accessCookieOptions
  );

  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",   // ⭐ 本地 & 同站点最稳
      secure: false,    // ⭐ localhost 必须 false
      path: "/",        // ⭐ GraphQL /graphql 能收到
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
  }
}