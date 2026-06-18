//src/core/booking/domain/service/booking-pricing.service.ts

export class BookingPricingService {

    static calculatePrice(
        nightlyPrice: number,
        checkInDate: Date,
        checkOutDate: Date,
    ): number {


        const msPerDay =1000 * 60 * 60 * 24;

        const nights =  Math.ceil((checkOutDate.getTime() - checkInDate.getTime())
                / msPerDay
            );

        if (nights <= 0) {
            throw new Error("Invalid booking duration");
        }

        return nightlyPrice * nights;


    }
}
