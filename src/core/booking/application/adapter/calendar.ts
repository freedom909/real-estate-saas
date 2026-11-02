
//src/core/booking/application/adapter/calendar.ts

import { injectable } from "tsyringe";

export interface ReserveSlotRequest {
  listingId: string;
  bookingId: string;
  checkIn: string;
  checkOut: string;
}

export interface ReleaseSlotRequest {
  bookingId: string;
  reason?: string;
}

@injectable()
export class CalendarClient {
  private async executeMutation(
    query: string,
    input: Record<string, any>
  ) {
    const token = process.env.INTERNAL_SERVICE_TOKEN;
    const url = process.env.CALENDAR_SUBGRAPH_URL;
const requestId = crypto.randomUUID();

console.log("[CalendarClient]", {
  requestId,
  operation: query.includes("ReserveCalendarSlots")
    ? "reserve"
    : "release",
});
    if (!token) {
      throw new Error("INTERNAL_SERVICE_TOKEN is not configured");
    }

    if (!url) {
      throw new Error("CALENDAR_SUBGRAPH_URL is not configured");
    }
   console.log("========== BOOKING CALLING CALENDAR ==========");
console.log("Calendar URL:", url);
console.log("Token configured:", Boolean(token));
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-service-token": token,
      },
      body: JSON.stringify({
        query,
        variables: { input },
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(
        `Calendar HTTP error: ${response.status} ${response.statusText}: ${responseText}`
      );
    }

    const result = JSON.parse(responseText);

    if (result.errors?.length) {
      throw new Error(result.errors.map((e: any) => e.message).join("; "));
    }

    return result.data;
  }

  async reserveSlot(input: ReserveSlotRequest) {
  const data = await this.executeMutation(
    `mutation ReserveCalendarSlots($input: ReserveSlotInput!) {
      reserveCalendarSlots(input: $input) {
        reserved
        listingId
        bookingId
        checkIn
        checkOut
      }
    }`,
    input
  );

  const result = data?.reserveCalendarSlots;

  if (!result || result.reserved <= 0) {
    throw new Error("Calendar reservation failed");
  }

  return result;
}

async releaseSlot(input: ReleaseSlotRequest) {
  const data = await this.executeMutation(
    `mutation ReleaseCalendarSlots($input: ReleaseSlotInput!) {
      releaseCalendarSlots(input: $input) {
        released
        bookingId
        reason
        message
      }
    }`,
    input
  );

  const result = data?.releaseCalendarSlots;

  if (!result) {
    throw new Error("Calendar release failed");
  }

  return result;
}
}