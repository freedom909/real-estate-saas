//

// src/core/payment/domain/event/payment.process.event.ts

import { DomainEvent } from "@/shared/eventbus/domain.event";

export class PaymentProcessedEvent extends DomainEvent {

  public readonly type = "PAYMENT_PROCESSED";
  public readonly eventName = "PAYMENT_PROCESSED";

  constructor(
    public readonly paymentId: string,
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly tenantId: string,  
    public readonly amount: number,
    public readonly checkInDate: Date,
    public readonly checkOutDate: Date,
    public readonly processedAt: Date,
 
  ) {
    super();
  }
}