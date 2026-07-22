// src/core/admin/domain/value-objects/email.ts

export class Email {
  private value: string;

  constructor(value: string) {
    if (!value || !this.isValid(value)) {
      throw new Error(`Invalid email: ${value}`);
    }
    this.value = value.toLowerCase();
  }

  getValue(): string {
    return this.value;
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
