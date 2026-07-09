//  
//

//
import { DomainEvent } from "@/shared/eventbus/domain.event";

export class PaymentConfirmedEvent extends DomainEvent {

  public readonly type = "PAYMENT_CONFIRMED";
  public readonly eventName = "PAYMENT_CONFIRMED";

  constructor(
    public readonly paymentId: string,
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly tenantId: string,  
    public readonly amount: number,
    public readonly checkInDate: Date,
    public readonly checkOutDate: Date,
    public readonly refundedAt: Date,
 
  ) {
    super();
  }
}