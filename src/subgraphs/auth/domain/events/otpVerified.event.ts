// domain/events/otpVerified.event.ts
export class OtpVerifiedEvent {
  constructor(
    public userId: string,
    public deviceId: string
  ) {

    
  }
}