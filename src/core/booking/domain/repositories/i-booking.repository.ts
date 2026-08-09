import { Booking } from "../entities/booking.entity";
import { BookingStatus } from "../value-objects/booking-status";

export interface BookingPaginatedResult {
 items: Booking[];
 total:number;
 page:number;
 limit:number;
 totalPages:number;
}


export interface BookingQuery {
    page: number;
    limit: number;

    status?: BookingStatus;

    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
}


export interface IBookingRepository {
  findById(id: string): Promise<Booking | null>;
  save(booking: Booking): Promise<void>;
  findByTenantId(tenantId:string):Promise<Booking[] >;
  findLatestBookingByCustomerId(customerId:string):Promise<Booking|null>;
  findByCustomerId(customerId: string): Promise<Booking[]>;
  delete(id: string): Promise<void>;
  findAll(query:BookingQuery):Promise<BookingPaginatedResult>
  findByListingOwnerId()
}