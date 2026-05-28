// application/dto/verifyOtp.command.ts

export interface VerifyOtpCommand {
  challengeId: string;
  otpCode: string;

  request: {
    ip: string;
    userAgent: string;
    deviceId: string;
  };
}