// FILE: src/core/booking/application/usecases/update-booking.usecase.ts

import { injectable, inject } from "tsyringe";
import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";
import { IBookingRepository } from "@/core/booking/domain/repositories/i-booking.repository";
import { BookingPricingService } from "../../domain/service/booking-pricing.service";
import { IListingGateway } from "../../domain/gateways/i-listing.gateway";
import { DateRange } from "../../domain/value-objects/date-range.vo";

@injectable()
export class UpdateBookingUseCase {
  constructor(
    @inject(TOKENS_BOOKING.repository.bookingRepository)
    private repo: IBookingRepository,

    @inject(TOKENS_BOOKING.gateway.listingGateway)
    private listingGateway: IListingGateway
  ) {}

  async execute(input: {
    id: string;
    checkInDate?: string;
    checkOutDate?: string;
    price?: number;
  }) {
    // 1. 找到 Booking
    const booking = await this.repo.findById(input.id);

    if (!booking) {
      throw new Error("Booking not found");
    }

    // 2. 更新入住 / 退房日期
    if (input.checkInDate && input.checkOutDate) {
      const checkIn = new Date(input.checkInDate);
      const checkOut = new Date(input.checkOutDate);

      // 日期格式验证
      if (
        isNaN(checkIn.getTime()) ||
        isNaN(checkOut.getTime())
      ) {
        throw new Error("Invalid date");
      }

      // DateRange 自己负责检查：
      // checkOut > checkIn
      const dateRange = new DateRange(
        checkIn,
        checkOut
      );

      // 根据 Listing 的每晚价格重新计算 Booking 总价
      const nightlyPrice =
        await this.listingGateway.getListingPrice(
          booking.listingId
        );

      const totalPrice =
        BookingPricingService.calculatePrice(
          nightlyPrice,
          checkIn,
          checkOut
        );

      // 通过 Domain Method 修改 Booking
      booking.updateDates(dateRange);
      booking.updatePrice(totalPrice);
    }

    // 3. 如果只有 price 被修改
    else if (input.price !== undefined) {
      booking.updatePrice(input.price);
    }

    // 4. 保存
    await this.repo.save(booking);

    // 5. 返回 Domain 数据
    return booking.toJSON();
  }
}