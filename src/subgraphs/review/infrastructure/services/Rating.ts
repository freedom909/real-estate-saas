export class Rating {
  constructor(public readonly value: number) {
    this.validate(value);
  }

  private validate(value: number): void {
    if (value < 1 || value > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
  }
}