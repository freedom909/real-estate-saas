import jwt from "jsonwebtoken";
import { injectable } from "tsyringe";

@injectable()
export class ServiceTokenService {
  generate(serviceName: string, scope: string[]) {
    return jwt.sign(
      {
        sub: serviceName,
        type: "service",
        scope,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "5m", // 🔥 短期
      }
    );
  }
}