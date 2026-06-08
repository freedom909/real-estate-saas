export interface BookingSnapshot {
  id: string;

  checkIn?: Date;

  checkOut?: Date;

  guestCount?: number;

  status?: string;
}