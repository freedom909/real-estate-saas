//src/core/booking/domain/value-objects/date-range.vo.ts


export class DateRange {
  constructor(
    public readonly checkInDate: Date,
    public readonly checkOutDate: Date
  ) {
    if (
      !(checkInDate instanceof Date) ||
      !(checkOutDate instanceof Date) ||
      !Number.isFinite(checkInDate.getTime()) ||
      !Number.isFinite(checkOutDate.getTime())
    ) {
      throw new Error("Invalid booking dates");
    }

    if (checkOutDate <= checkInDate) {
      throw new Error("Check-out must be after check-in");
    }
  }

  get nights(): number {
    const msPerDay = 86400000;

    return Math.round(
      (this.checkOutDate.getTime() -
        this.checkInDate.getTime()) / msPerDay
    );
  }

  toJSON() {
    return {
      checkInDate: this.checkInDate,
      checkOutDate: this.checkOutDate,
    };
  }
}
