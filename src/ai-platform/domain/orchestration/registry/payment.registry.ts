import { AIDomain } from "@/ai-platform/domain/semantic/types/ai.domain";
import { CapabilityRegistryMap, RiskLevel } from "./capability-registry.types";
import { Operator } from "../state/world-state";

export const PaymentRegistry: CapabilityRegistryMap = {
  PROCESS_PAYMENT: {
    id: "PROCESS_PAYMENT",
    domain: AIDomain.PAYMENT,
    description: "Process payment for a booking",
    preconditions: [
      { entity: "booking", field: "status", operator: Operator.EQ, value: "confirmed" },
    ],
    effects: [
      { entity: "payment", field: "status", value: "processed" },
    ],
    inputs: [
      { name: "bookingId", type: "string", entity: "booking", field: "id" },
      { name: "amount", type: "number" },
      { name: "paymentMethod", type: "string" },
    ],
    outputs: [
      { name: "paymentId", type: "string", entity: "payment", field: "id" },
      { name: "transactionId", type: "string" },
    ],
    executorId: "payment.process",
    tags: ["payment", "process"],
    permissions: ["payment:process"],
    cost: 0.03,
    timeoutMs: 30000,
    retry: { maxAttempts: 3, backoffMs: 2000, retryOnErrors: ["NetworkError", "PaymentGatewayError"] },
    sideEffects: ["payment.logged", "booking.updated"],
    riskLevel: RiskLevel.HIGH,
  },

  PROCESS_REFUND: {
    id: "PROCESS_REFUND",
    domain: AIDomain.PAYMENT,
    description: "Process refund for a cancelled booking",
    preconditions: [
      { entity: "booking", field: "status", operator: Operator.EQ, value: "cancelled" },
    ],
    effects: [
      { entity: "refund", field: "created", value: true },
      { entity: "payment", field: "status", value: "refunded" },
    ],
    inputs: [
      { name: "bookingId", type: "string", entity: "booking", field: "id" },
      { name: "reason", type: "string" },
    ],
    outputs: [
      { name: "refundId", type: "string", entity: "refund", field: "id" },
      { name: "transactionId", type: "string" },
    ],
    executorId: "payment.refund",
    compensation: ["REVERSE_REFUND"],
    tags: ["payment", "refund"],
    permissions: ["payment:refund"],
    cost: 0.02,
    timeoutMs: 45000,
    retry: { maxAttempts: 2, backoffMs: 3000, retryOnErrors: ["NetworkError"] },
    sideEffects: ["refund.logged", "booking.updated"],
    riskLevel: RiskLevel.HIGH,
  },

  REVERSE_REFUND: {
    id: "REVERSE_REFUND",
    domain: AIDomain.PAYMENT,
    description: "Reverse a previously processed refund",
    preconditions: [
      { entity: "refund", field: "created", operator: Operator.EQ, value: true },
    ],
    effects: [
      { entity: "refund", field: "created", value: false },
      { entity: "payment", field: "status", value: "processed" },
    ],
    inputs: [
      { name: "refundId", type: "string", entity: "refund", field: "id" },
    ],
    outputs: [
      { name: "reversed", type: "boolean" },
    ],
    executorId: "payment.reverseRefund",
    tags: ["payment", "compensation"],
    permissions: ["payment:reverse"],
    cost: 0.02,
    timeoutMs: 30000,
    riskLevel: RiskLevel.HIGH,
  },
};
