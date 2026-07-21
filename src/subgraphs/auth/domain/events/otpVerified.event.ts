// domain/events/otpVerified.event.ts
import { DomainEvent } from "@/shared/eventbus/domain.event";

export class OtpVerifiedEvent extends DomainEvent {
  readonly eventName = "OtpVerified";

  constructor(
    public userId: string,
    public deviceId: string
  ) {
    super();
  }
}
