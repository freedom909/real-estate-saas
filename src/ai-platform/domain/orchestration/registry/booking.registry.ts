import { AIDomain } from "@/ai-platform/domain/semantic/types/ai.domain";
import { CapabilityRegistryMap, RiskLevel } from "./capability-registry.types";
import { Operator } from "../state/world-state";

export const BookingRegistry: CapabilityRegistryMap = {
  CREATE_BOOKING: {
    id: "CREATE_BOOKING",
    domain: AIDomain.BOOKING,
    description: "Create a new booking for a listing",
    preconditions: [],
    effects: [
      { entity: "booking", field: "status", value: "pending" },
    ],
    inputs: [
      { name: "listingId", type: "string", entity: "listing", field: "id" },
      { name: "guestId", type: "string", entity: "user", field: "id" },
      { name: "checkInDate", type: "Date" },
      { name: "checkOutDate", type: "Date" },
    ],
    outputs: [
      { name: "bookingId", type: "string", entity: "booking", field: "id" },
    ],
    executorId: "booking.create",
    tags: ["booking", "create"],
    permissions: ["booking:create"],
    cost: 0,
    timeoutMs: 30000,
    retry: { maxAttempts: 3, backoffMs: 1000, retryOnErrors: ["NetworkError", "TimeoutError"] },
    sideEffects: ["calendar.blocked", "notification.sent"],
    riskLevel: RiskLevel.MEDIUM,
  },

  CONFIRM_BOOKING: {
    id: "CONFIRM_BOOKING",
    domain: AIDomain.BOOKING,
    description: "Confirm a pending booking",
    preconditions: [
      { entity: "booking", field: "status", operator: Operator.EQ, value: "pending" },
    ],
    effects: [
      { entity: "booking", field: "status", value: "confirmed" },
    ],
    inputs: [
      { name: "bookingId", type: "string", entity: "booking", field: "id" },
    ],
    outputs: [
      { name: "bookingId", type: "string", entity: "booking", field: "id" },
      { name: "status", type: "string" },
    ],
    executorId: "booking.confirm",
    tags: ["booking", "confirm"],
    permissions: ["booking:confirm"],
    cost: 0,
    timeoutMs: 10000,
    retry: { maxAttempts: 2, backoffMs: 500, retryOnErrors: ["NetworkError"] },
    sideEffects: ["host.notified", "guest.notified"],
    riskLevel: RiskLevel.LOW,
  },

  COMPLETE_BOOKING: {
    id: "COMPLETE_BOOKING",
    domain: AIDomain.BOOKING,
    description: "Mark a booking as completed after stay",
    preconditions: [
      { entity: "booking", field: "status", operator: Operator.EQ, value: "confirmed" },
    ],
    effects: [
      { entity: "booking", field: "status", value: "completed" },
    ],
    inputs: [
      { name: "bookingId", type: "string", entity: "booking", field: "id" },
    ],
    outputs: [
      { name: "bookingId", type: "string", entity: "booking", field: "id" },
      { name: "status", type: "string" },
    ],
    executorId: "booking.complete",
    tags: ["booking", "complete"],
    permissions: ["booking:complete"],
    cost: 0,
    timeoutMs: 10000,
    riskLevel: RiskLevel.LOW,
  },

  CANCEL_BOOKING: {
    id: "CANCEL_BOOKING",
    domain: AIDomain.BOOKING,
    description: "Cancel an existing booking",
    preconditions: [
      { entity: "booking", field: "status", operator: Operator.EQ, value: "confirmed" },
    ],
    effects: [
      { entity: "booking", field: "status", value: "cancelled" },
    ],
    inputs: [
      { name: "bookingId", type: "string", entity: "booking", field: "id" },
      { name: "reason", type: "string" },
    ],
    outputs: [
      { name: "bookingId", type: "string", entity: "booking", field: "id" },
      { name: "status", type: "string" },
    ],
    executorId: "booking.cancel",
    tags: ["booking", "cancel"],
    permissions: ["booking:cancel"],
    cost: 0,
    timeoutMs: 15000,
    retry: { maxAttempts: 2, backoffMs: 1000, retryOnErrors: ["NetworkError"] },
    sideEffects: ["calendar.released", "host.notified", "guest.notified"],
    riskLevel: RiskLevel.HIGH,
  },

  RELEASE_CALENDAR: {
    id: "RELEASE_CALENDAR",
    domain: AIDomain.BOOKING,
    description: "Release calendar dates for a cancelled booking",
    preconditions: [
      { entity: "booking", field: "status", operator: Operator.EQ, value: "cancelled" },
    ],
    effects: [
      { entity: "calendar", field: "availability", value: true },
    ],
    inputs: [
      { name: "bookingId", type: "string", entity: "booking", field: "id" },
    ],
    outputs: [
      { name: "bookingId", type: "string", entity: "booking", field: "id" },
      { name: "datesReleased", type: "boolean" },
    ],
    executorId: "booking.releaseCalendar",
    tags: ["booking", "calendar"],
    permissions: ["calendar:release"],
    cost: 0,
    timeoutMs: 5000,
    sideEffects: ["listing.availability.updated"],
    riskLevel: RiskLevel.LOW,
  },

  NOTIFY_HOST: {
    id: "NOTIFY_HOST",
    domain: AIDomain.BOOKING,
    description: "Notify host about booking changes",
    preconditions: [
      { entity: "booking", field: "id", operator: Operator.EXISTS },
    ],
    effects: [],
    inputs: [
      { name: "bookingId", type: "string", entity: "booking", field: "id" },
      { name: "message", type: "string" },
    ],
    outputs: [
      { name: "notificationId", type: "string" },
      { name: "sent", type: "boolean" },
    ],
    executorId: "booking.notifyHost",
    tags: ["notification", "host"],
    permissions: ["notification:send"],
    cost: 0.01,
    timeoutMs: 10000,
    sideEffects: ["notification.logged"],
    riskLevel: RiskLevel.LOW,
  },
};
