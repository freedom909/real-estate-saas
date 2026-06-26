// token-payload.ts

// domain/types/token-payload.ts

export interface TokenPayload {
    sub: string;
    sessionId: string;
    type: "access" | "refresh";
    jti: string;
    iat?: number;
    exp?: number;
}