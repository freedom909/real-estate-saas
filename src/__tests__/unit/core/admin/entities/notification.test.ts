import { describe, it, expect } from "@jest/globals";
import { Notification } from "@/core/admin/domain/entities/notification";

describe("Notification entity", () => {
  function makeNotif(overrides: Partial<any> = {}) {
    return new Notification({
      id: "n-1",
      adminId: "admin-1",
      type: "INFO",
      title: "Test",
      message: "Hello",
      isRead: false,
      createdAt: new Date(),
      ...overrides,
    });
  }

  it("should create a notification with all fields", () => {
    const now = new Date();
    const n = new Notification({
      id: "n-1",
      adminId: "admin-1",
      type: "WARNING",
      title: "Alert",
      message: "Something happened",
      target: "booking",
      targetId: "b-1",
      isRead: false,
      createdAt: now,
    });

    expect(n.id).toBe("n-1");
    expect(n.adminId).toBe("admin-1");
    expect(n.type).toBe("WARNING");
    expect(n.title).toBe("Alert");
    expect(n.message).toBe("Something happened");
    expect(n.target).toBe("booking");
    expect(n.targetId).toBe("b-1");
    expect(n.isRead).toBe(false);
    expect(n.createdAt).toBe(now);
  });

  it("should have optional target fields undefined", () => {
    const n = makeNotif();
    expect(n.target).toBeUndefined();
    expect(n.targetId).toBeUndefined();
  });

  describe("markAsRead", () => {
    it("should set isRead to true", () => {
      const n = makeNotif();
      expect(n.isRead).toBe(false);
      n.markAsRead();
      expect(n.isRead).toBe(true);
    });
  });

  describe("markAsUnread", () => {
    it("should set isRead to false", () => {
      const n = makeNotif({ isRead: true });
      expect(n.isRead).toBe(true);
      n.markAsUnread();
      expect(n.isRead).toBe(false);
    });
  });

  it("should support all notification types", () => {
    const types = ["INFO", "WARNING", "ERROR", "SUCCESS"] as const;
    for (const type of types) {
      const n = new Notification({
        id: `n-${type}`,
        adminId: "a1",
        type,
        title: "T",
        message: "M",
        isRead: false,
        createdAt: new Date(),
      });
      expect(n.type).toBe(type);
    }
  });
});
