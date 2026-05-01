// auth/domain/services/otpService.ts

interface OtpService {
  generate(challengeId: string): Promise<string>
  verify(challengeId: string, code: string): Promise<boolean>
  invalidate(challengeId: string): Promise<void>
}