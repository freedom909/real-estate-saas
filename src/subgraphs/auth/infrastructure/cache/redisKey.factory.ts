// infrastructure/cache/redisKey.factory.ts

export const RedisKeys = {
  otp: (challengeId: string) => `otp:${challengeId}`,
  otpAttempts: (challengeId: string) => `otp:attempts:${challengeId}`,
  otpSend: (userId: string) => `otp:send:${userId}`,
  otpIp: (ip: string) => `otp:ip:${ip}`,
  deviceRisk: (deviceId: string) => `device:risk:${deviceId}`
};