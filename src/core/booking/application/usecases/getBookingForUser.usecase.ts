
import { injectable, inject } from "tsyringe";
import { BookingQuery, IBookingRepository } from "../../domain/repositories/i-booking.repository";
import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";

@injectable()
export class GetBookingForUserUseCase {
  constructor(
    @inject(TOKENS_BOOKING.repository.bookingRepository)
    private repo: IBookingRepository
  ) {}

  async execute(user,BookingFilterInput ) {
    const {role,userId}=user
    const tenantId = user.tenant
    const query: BookingQuery = {
        page: BookingFilterInput .page,
        limit: BookingFilterInput .limit,
        status: BookingFilterInput .status
    };
    switch(role){
            case "CUSTOMER":
        return this.repo.findByCustomerId(userId);
              case "OWNER":
        return this.repo.findByTenantId(tenantId);
              case "ADMIN":
        return this.repo.findAll(query);
        default: throw new Error("Forbidden");
  }
}}