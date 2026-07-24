import { describe, it, expect } from "@jest/globals";
import { Email } from "@/core/admin/domain/value-objects/email";

describe("Email value object", () => {
  it("should create a valid email", () => {
    const email = new Email("test@example.com");
    expect(email.getValue()).toBe("test@example.com");
  });

  it("should normalize to lowercase", () => {
    const email = new Email("TEST@EXAMPLE.COM");
    expect(email.getValue()).toBe("test@example.com");
  });

  it("should throw for empty string", () => {
    expect(() => new Email("")).toThrow("Invalid email:");
  });

  it("should throw for null/undefined", () => {
    expect(() => new Email(null as any)).toThrow();
    expect(() => new Email(undefined as any)).toThrow();
  });

  it("should throw for missing @", () => {
    expect(() => new Email("invalid")).toThrow("Invalid email:");
  });

  it("should throw for missing domain", () => {
    expect(() => new Email("user@")).toThrow("Invalid email:");
  });

  it("should throw for missing TLD", () => {
    expect(() => new Email("user@example")).toThrow("Invalid email:");
  });

  it("should accept subdomains", () => {
    const email = new Email("user@sub.example.com");
    expect(email.getValue()).toBe("user@sub.example.com");
  });

  it("should accept plus addressing", () => {
    const email = new Email("user+tag@example.com");
    expect(email.getValue()).toBe("user+tag@example.com");
  });

  it("should throw for spaces", () => {
    expect(() => new Email("user @example.com")).toThrow("Invalid email:");
  });
});
