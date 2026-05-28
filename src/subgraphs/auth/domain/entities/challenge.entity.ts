export class Challenge {
  constructor(
    public id: string,
    public userId: string,
    public deviceId: string,
    public type: "OTP",
    public expiresAt: Date,
    public status: "PENDING" | "VERIFIED" | "EXPIRED"
  ) {}

    verify() {
    if (this.status !== "PENDING") {
      throw new Error("Invalid state");
    }
    this.status = "VERIFIED";
  }
  
  isExpired() {
    return new Date() > this.expiresAt;
  }
}

export default Challenge;