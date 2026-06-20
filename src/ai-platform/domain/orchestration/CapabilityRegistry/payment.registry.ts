import { AIDomain } from "@/ai-platform/domain/semantic/types/ai.domain";
import { ProcessPaymentCapability, CreateRefundCapability } from "@/ai-platform/application/capabilities/payment/payment.capability";

export const PaymentRegistry = {
  PROCESS_PAYMENT: {
    domain: AIDomain.PAYMENT,
    capability: ProcessPaymentCapability,
    dependsOn: ["CONFIRM_BOOKING"]
  },
  PROCESS_REFUND: {
    domain: AIDomain.PAYMENT,
    capability: CreateRefundCapability,
    dependsOn: ["CANCEL_BOOKING"],
    compensation: ["REVERSE_REFUND"]
  }
};