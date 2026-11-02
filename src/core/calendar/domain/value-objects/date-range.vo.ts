// src/core/calendar/domain/value-objects/date-range.vo.ts

export class CalendarDateRange {
  constructor(
    public readonly checkIn: Date,
    public readonly checkOut: Date
  ) {
    if (
      isNaN(checkIn.getTime()) ||
      isNaN(checkOut.getTime()) ||
      checkOut <= checkIn
    ) {
      throw new Error("Invalid date range");
    }
  }

  nights(): Date[] {
    const dates: Date[] = [];

    const current = new Date(this.checkIn);
    current.setUTCHours(0, 0, 0, 0);

    const end = new Date(this.checkOut);
    end.setUTCHours(0, 0, 0, 0);

    while (current < end) {
      dates.push(new Date(current));
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return dates;
  }

  overlaps(other: CalendarDateRange): boolean {
    return (
      this.checkIn < other.checkOut &&
      other.checkIn < this.checkOut
    );
  }

  toJSON() {
    return {
      checkIn: this.checkIn,
      checkOut: this.checkOut,
    };
  }
}
