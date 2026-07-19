//src/
import { BookingStatus } from "../value-objects/booking-status";

const BOOKING_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.PENDING]: [
        BookingStatus.CONFIRMED,
        BookingStatus.CANCELLED,
    ],

    [BookingStatus.CONFIRMED]: [
        BookingStatus.CHECKED_IN,
        BookingStatus.CANCELLED,
    ],

    [BookingStatus.CHECKED_IN]: [
        BookingStatus.COMPLETED,
        BookingStatus.CANCELLED,
    ],

    [BookingStatus.CANCELLED]: [],

    [BookingStatus.COMPLETED]: [],

};

export class BookingTransitionService {
    static ensureTransition(
        current: BookingStatus,
        next: BookingStatus
    ) {
        const allowed =
            BOOKING_STATUS_TRANSITIONS[current];

        if (!allowed.includes(next)) {
            throw new Error(
                `Invalid transition from ${current} to ${next}`
            );
        }

    }
}