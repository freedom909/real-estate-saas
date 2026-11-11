
//src/core/booking/application/adapter/calendar.ts

import { parseDateOnly } from "@/infrastructure/utils/parseDateOnly";
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

    if (!result) {
      throw new Error("Calendar reservation failed");
    }

    if (
      result.listingId !== input.listingId ||
      result.bookingId !== input.bookingId ||
        result.checkIn !== input.checkIn ||
  result.checkOut !== input.checkOut
    ) {
      throw new Error("Calendar reservation response mismatch");
    }

const checkIn = parseDateOnly(input.checkIn);
const checkOut = parseDateOnly(input.checkOut);

    const expectedNights = calculateExpectedNights(
      input.checkIn,
      input.checkOut
    );

    if (
      !Number.isInteger(result.reserved) ||
      result.reserved !== expectedNights
    ) {
      throw new Error(
        `Calendar reservation incomplete: expected ${expectedNights}, got ${result.reserved}`
      );
    }

    if (result.reserved !== expectedNights) {
      throw new Error(
        `Calendar reservation incomplete: expected ${expectedNights}, got ${result.reserved}`
      );
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
    if (
      result.bookingId !== input.bookingId ||
      result.reason !== input.reason
    ) {
      throw new Error("Calendar release response mismatch");
    }
    return result;
  }
}



function calculateExpectedNights(
  checkInValue: string,
  checkOutValue: string
): number {
  const checkIn = parseDateOnly(checkInValue);
  const checkOut = parseDateOnly(checkOutValue);

  if (checkIn >= checkOut) {
    throw new Error("Check-out must be after check-in");
  }

  return (
    (checkOut.getTime() - checkIn.getTime()) / 86400000
  );
}
