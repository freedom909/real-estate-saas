// src/core/calendar/domain/value-objects/date-range.vo.ts

export class CalendarDateRange {
  constructor(
    public readonly checkIn: Date,
    public readonly checkOut: Date
  ) {
    if (checkOut <= checkIn) {
      throw new Error("checkOut must be after checkIn");
    }
  }

  /** Returns every night date (checkIn inclusive, checkOut exclusive) */
  nights(): Date[] {
    const dates: Date[] = [];
    const current = new Date(this.checkIn);
    while (current < this.checkOut) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  overlaps(other: CalendarDateRange): boolean {
    return this.checkIn < other.checkOut && other.checkIn < this.checkOut;
  }

  toJSON() {
    return { checkIn: this.checkIn, checkOut: this.checkOut };
  }
}
