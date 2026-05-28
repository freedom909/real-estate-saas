

// infrastructure/services/otp.service.ts
import crypto from "crypto";
import { IOTPService } from "../../application/services/IOTPService";

export class OTPService implements IOTPService {
  private readonly secret = process.env.OTP_SECRET || "dev-secret";

  async generate(length: number = 6) {
    if (length <= 0 || length > 10) {
      throw new Error("Invalid OTP length");
    }

    const min = 10 ** (length - 1);
    const max = 10 ** length - 1;

    const num = crypto.randomInt(min, max + 1);
    const code = String(num);

    const hash = this.hash(code);

    return { code, hash };
  }

  async sendOTP(
    target: { userId: string; email?: string; phone?: string },
    code: string
  ) {
    // 👉 这里你可以换成：
    // - SendGrid（邮件）
    // - Twilio（短信）

    if (target.email) {
      console.log(`📧 Send OTP to email ${target.email}: ${code}`);
    }

    if (target.phone) {
      console.log(`📱 Send OTP to phone ${target.phone}: ${code}`);
    }

    // fallback（开发环境）
    if (!target.email && !target.phone) {
      console.log(`🔐 OTP (dev): ${code}`);
    }
  }

  async verify(input: string, storedHash: string): Promise<boolean> {
    const hash = this.hash(input);

    try {
      return crypto.timingSafeEqual(
        Buffer.from(hash),
        Buffer.from(storedHash)
      );
    } catch {
      return false;
    }
  }

  private hash(code: string): string {
    return crypto
      .createHmac("sha256", this.secret)
      .update(code)
      .digest("hex");
  }
}