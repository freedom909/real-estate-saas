import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        sessionId?: string;
        type?: string;
        tenantId?: string;
      };

      tenantId?: string;
    }
  }
}

export {};