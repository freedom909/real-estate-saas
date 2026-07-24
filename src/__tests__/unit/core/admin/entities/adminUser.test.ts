// @ts-nocheck
import { describe, it, expect } from "@jest/globals";
import { AdminUser } from "@/core/admin/domain/entities/adminUser";
import { Email } from "@/core/admin/domain/value-objects/email";

function makeProps(overrides: Partial<any> = {}) {
  return {
    id: "admin-1",
    email: new Email("admin@test.com"),
    name: "Admin User",
    role: "ADMIN" as const,
    isActive: true,
    immutable: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

describe("AdminUser entity", () => {
  describe("constructor", () => {
    it("should create a valid admin user", () => {
      const admin = new AdminUser(makeProps());
      expect(admin.id).toBe("admin-1");
      expect(admin.email).toBe("admin@test.com");
      expect(admin.name).toBe("Admin User");
      expect(admin.role).toBe("ADMIN");
      expect(admin.isActive).toBe(true);
      expect(admin.immutable).toBe(false);
    });

    it("should default immutable to false", () => {
      const admin = new AdminUser(makeProps({ immutable: undefined } as any));
      expect(admin.immutable).toBe(false);
    });

    it("should throw when id is missing", () => {
      expect(() => new AdminUser(makeProps({ id: "" }))).toThrow("AdminUser id required");
    });

    it("should throw when email is missing", () => {
      expect(() => new AdminUser(makeProps({ email: null }))).toThrow();
    });

    it("should throw when name is missing", () => {
      expect(() => new AdminUser(makeProps({ name: "" }))).toThrow("AdminUser name required");
    });

    it("should throw when role is missing", () => {
      expect(() => new AdminUser(makeProps({ role: "" }))).toThrow("AdminUser role required");
    });

    it("should throw when isActive is undefined", () => {
      expect(() => new AdminUser(makeProps({ isActive: undefined }))).toThrow("AdminUser isActive required");
    });

    it("should default immutable to false when undefined", () => {
      const admin = new AdminUser(makeProps({ immutable: undefined }));
      expect(admin.immutable).toBe(false);
    });

    it("should throw when createdAt is missing", () => {
      expect(() => new AdminUser(makeProps({ createdAt: undefined }))).toThrow("AdminUser createdAt required");
    });

    it("should throw when updatedAt is missing", () => {
      expect(() => new AdminUser(makeProps({ updatedAt: undefined }))).toThrow("AdminUser updatedAt required");
    });
  });

  describe("updateName", () => {
    it("should update name and touch updatedAt", () => {
      const admin = new AdminUser(makeProps());
      const before = admin.updatedAt;
      admin.updateName("New Name");
      expect(admin.name).toBe("New Name");
      expect(admin.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe("updateRole", () => {
    it("should update role", () => {
      const admin = new AdminUser(makeProps());
      admin.updateRole("SUPER_ADMIN");
      expect(admin.role).toBe("SUPER_ADMIN");
    });
  });

  describe("deactivate / activate", () => {
    it("should deactivate the admin", () => {
      const admin = new AdminUser(makeProps());
      admin.deactivate();
      expect(admin.isActive).toBe(false);
    });

    it("should activate the admin", () => {
      const admin = new AdminUser(makeProps({ isActive: false }));
      admin.activate();
      expect(admin.isActive).toBe(true);
    });
  });

  describe("recordLogin", () => {
    it("should set lastLoginAt", () => {
      const admin = new AdminUser(makeProps());
      expect(admin.lastLoginAt).toBeUndefined();
      admin.recordLogin();
      expect(admin.lastLoginAt).toBeInstanceOf(Date);
    });
  });

  describe("getters", () => {
    it("should expose avatar", () => {
      const admin = new AdminUser(makeProps({ avatar: "https://example.com/avatar.jpg" }));
      expect(admin.avatar).toBe("https://example.com/avatar.jpg");
    });

    it("should return undefined for optional fields when not set", () => {
      const admin = new AdminUser(makeProps());
      expect(admin.avatar).toBeUndefined();
      expect(admin.lastLoginAt).toBeUndefined();
    });
  });
});
