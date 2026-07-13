// src/core/account/application/adapter/booking.acl.ts

import { BookingExternalDTO } from "@/core/booking/bookingDTO";
import { BookingGateway } from "@/core/booking/bookingGateway";
import { TOKENS_ACCOUNT } from "@/modules/tokens/account.token";
import { inject, injectable } from "tsyringe";

@injectable()
export class BookingACL {
    constructor(
        @inject(TOKENS_ACCOUNT.BookingGateway)
        private gateway: BookingGateway
    ) {}

    async getContexts(userId: string): Promise<BookingContext[]> {
        const rawBookings: BookingExternalDTO[] = await this.gateway.fetchBookingData(userId);
        return rawBookings.map((booking) => ({

            bookingId: booking.id,
            userId: booking.customerId,
            amount: booking.price,
            status: booking.status,
            ipAddress: booking.metadata?.ipAddress ?? "",
            userAgent: booking.metadata?.userAgent ?? "",
            history: {
                previousCancellations:
                    booking.customerStats?.cancellationCount ?? 0,
                totalBookings:
                    booking.customerStats?.totalBookingsCount ?? 0,
            },

            metadata: booking.metadata ?? {},
            riskScore: 0,
        }));
    }
}