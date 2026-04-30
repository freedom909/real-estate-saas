export class Challenge {
  constructor(
    public id: string,
    public userId: string,
    public deviceId: string,
    public type: "OTP",
    public expiresAt: Date
  ) {}

  isExpired() {
    return new Date() > this.expiresAt;
  }
}

export default Challenge;