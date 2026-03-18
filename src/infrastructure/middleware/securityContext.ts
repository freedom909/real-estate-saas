import { Request, Response, NextFunction } from 'express';

interface SecurityContext {
  ip?: string;
  userAgent?: string;
  requestStart: number;
}

declare global {
  namespace Express {
    interface Request {
      securityContext?: SecurityContext;
    }
  }
}

export const securityContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.securityContext = {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    requestStart: Date.now(),
  };
  next();
};