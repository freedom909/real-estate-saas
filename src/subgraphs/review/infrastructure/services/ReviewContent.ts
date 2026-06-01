export class ReviewContent {
  constructor(public readonly value: string) {
    this.validate(value);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error("Review content cannot be empty");
    }
  }
}