// Address.ts

export class Address {
  constructor(private value: string) {
    if (!value || value.length < 5) {
      throw new Error("Invalid address");
    }
  }

  getValue() {
    return this.value;
  }
}