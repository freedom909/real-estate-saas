export class DateRange {
  constructor(
    public readonly checkInDate: Date,
    public readonly checkOutDate: Date
  ) {
    if (checkOutDate <= checkInDate) {
      throw new Error("Check-out must be after check-in");
    }
  }

  toJSON() {
    return {
      checkInDate: this.checkInDate,
      checkOutDate: this.checkOutDate,
    };
  }
}