import { describe, it, expect, jest, afterEach, beforeEach } from '@jest/globals';
import { Session } from "@/subgraphs/auth/domain/entities/session.entity";

describe("Session", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should create a session with required fields", () => {
    const session = new Session(
      "sess-1",
      "user-1",
      "dev-1",
      "192.168.1.1",
      "Mozilla/5.0",
      new Date("2024-01-15T10:00:00Z"),
      new Date("2024-01-15T11:00:00Z")
    );

    expect(session.id).toBe("sess-1");
    expect(session.userId).toBe("user-1");
    expect(session.deviceId).toBe("dev-1");
    expect(session.ip).toBe("192.168.1.1");
    expect(session.userAgent).toBe("Mozilla/5.0");
  });

  it("should default createAt to now when not provided", () => {
    const before = new Date();
    const session = new Session(
      "sess-1",
      "user-1",
      "dev-1",
      "127.0.0.1",
      "Chrome",
      undefined as any,
      new Date()
    );
    const after = new Date();

    expect(session.createAt).toBeDefined();
    expect((session.createAt as Date).getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect((session.createAt as Date).getTime()).toBeLessThanOrEqual(after.getTime());
  });

  describe("touch", () => {
    it("should update lastSeenAt to current time", () => {
      const session = new Session(
        "sess-1",
        "user-1",
        "dev-1",
        "127.0.0.1",
        "Chrome",
        new Date("2024-01-15T10:00:00Z"),
        new Date("2024-01-15T11:00:00Z")
      );

      session.touch();

      expect(session.lastSeenAt).toEqual(new Date("2024-01-15T12:00:00Z"));
    });

    it("should update lastSeenAt multiple times", () => {
      const session = new Session(
        "sess-1",
        "user-1",
        "dev-1",
        "127.0.0.1",
        "Chrome",
        new Date("2024-01-15T10:00:00Z"),
        new Date("2024-01-15T11:00:00Z")
      );

      session.touch();
      expect(session.lastSeenAt).toEqual(new Date("2024-01-15T12:00:00Z"));

      jest.setSystemTime(new Date("2024-01-15T13:00:00Z"));
      session.touch();
      expect(session.lastSeenAt).toEqual(new Date("2024-01-15T13:00:00Z"));
    });
  });
});
