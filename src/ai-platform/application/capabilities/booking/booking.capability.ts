import { CancelBookingUseCase } from "@/core/booking/application/usecases/cancel-booking.usecase";
import { CompleteBookingUseCase } from "@/core/booking/application/usecases/complete-booking.usecase";
import { ConfirmBookingUseCase } from "@/core/booking/application/usecases/confirm-booking.usecase";
import { CreateBookingUseCase } from "@/core/booking/application/usecases/create-booking.usecase";
import { delay, inject, injectable } from "tsyringe";

@injectable()
export class BookingCapability {

constructor(
    @inject(delay(()=>CreateBookingUseCase))
    private createBookingUseCase:CreateBookingUseCase,
    @inject(delay(()=>CancelBookingUseCase))
    private cancelBookingUseCase:CancelBookingUseCase,
        @inject(delay(() => ConfirmBookingUseCase))
    private confirmBookingUseCase: ConfirmBookingUseCase,

    @inject(delay(() => CompleteBookingUseCase))
    private completeBookingUseCase: CompleteBookingUseCase,
){}
   async createBooking(input:any){
    return this.createBookingUseCase.execute(input)
   }

   async cancelBooking(
    bookingId:string,
    reason:string
  ) {
    return this.cancelBookingUseCase.execute(
      bookingId,
      reason
    );
  }

  async confirmBooking(
    bookingId:string
  ) {
    return this.confirmBookingUseCase.execute(
      bookingId
    );
  }

  async completeBooking(
    bookingId:string
  ) {
    return this.completeBookingUseCase.execute(
      bookingId
    );
  }
}