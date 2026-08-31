/**
 * Placeholder for a future Booking <-> Listing federation integration test.
 * This file previously had 0 lines of content, which caused Jest to report
 * "Your test suite must contain at least one test" and fail the entire CI
 * job with exit code 1 even when all *other* test suites passed.
 *
 * Replace this placeholder with a real Apollo Gateway + booking+listing
 * subgraphs contract test once the federation setup is ready in-process.
 */
import "reflect-metadata";
import { describe, it, expect } from "@jest/globals";

describe("Booking + Listing federation (placeholder)", () => {
  it("placeholder: suite is not empty (prevents Jest 'at least one test' failure)", () => {
    expect(true).toBe(true);
  });
});
