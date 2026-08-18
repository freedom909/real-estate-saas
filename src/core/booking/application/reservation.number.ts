//src/core/booking/application/reservation.number.ts

export function generateReservationNumber(): string {
  return `BK-${Date.now()}-${crypto.randomUUID()
    .split("-")[0]
    .toUpperCase()}`;
}