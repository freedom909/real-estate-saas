//src/core/booking/application/adapter/calendar.ts


import { ReserveSlotInput } from "@/core/calendar/application/usecases/reserve-slot.usecase";
import { injectable } from "tsyringe";

export interface ReserveSlotRequest {
  listingId: string;
  bookingId: string;
  checkIn: string;
  checkOut: string;
}

@injectable()
export class CalendarClient {

  async reserveSlot(input: ReserveSlotRequest) {
    const response = await fetch(
      "http://localhost:4100/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation ReserveSlot($input: ReserveSlotInput!) {
              reserveSlot(input: $input) {
                success
              }
            }
          `,
          variables: {
            input,
          },
        }),
      }
    );

    return response.json();
  }

  async releaseSlot(input: ReserveSlotRequest) {
    const response = await fetch(
      "http://localhost:4100/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation ReleaseSlot($input: ReleaseSlotInput!) {
              releaseSlot(input: $input) {
                success
              }
            }
          `,
          variables: {
            input,
          },
        }),
      }
    );

    return response.json();
  }
}