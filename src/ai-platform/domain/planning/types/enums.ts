// src/gateway/cognition/domain/types/enums.ts
export enum AIDomain {
  LISTING = "LISTING",
  BOOKING = "BOOKING",
  PAYMENT = "PAYMENT",
}

export enum CapabilityType {
  // Booking capabilities
  CANCEL_BOOKING = "CANCEL_BOOKING",

  // Payment capabilities
  REFUND_PAYMENT = "REFUND_PAYMENT",

  // Listing capabilities
  OPTIMIZE_CONTENT = "OPTIMIZE_CONTENT",
  GENERATE_CONTENT = "GENERATE_CONTENT",
}

export enum TaskStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}