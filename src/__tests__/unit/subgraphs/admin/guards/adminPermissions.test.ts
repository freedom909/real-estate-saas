import { describe, it, expect } from "@jest/globals";

import {
  hasPermission,
  getPermissions,
  getRoleLevel,
  AdminRole,
  Permission,
} from "@/subgraphs/admin/guards/adminPermissions";

describe("adminPermissions", () => {
  // ─── hasPermission ──────────────────────────────────────────────────────
  describe("hasPermission", () => {
    describe("MODERATOR", () => {
      it("should allow dashboard:view", () => {
        expect(hasPermission("MODERATOR", "dashboard:view")).toBe(true);
      });

      it("should allow users:view", () => {
        expect(hasPermission("MODERATOR", "users:view")).toBe(true);
      });

      it("should allow audit_logs:view", () => {
        expect(hasPermission("MODERATOR", "audit_logs:view")).toBe(true);
      });

      it("should allow profile:view", () => {
        expect(hasPermission("MODERATOR", "profile:view")).toBe(true);
      });

      it("should allow profile:update", () => {
        expect(hasPermission("MODERATOR", "profile:update")).toBe(true);
      });

      it("should deny admin_users:view", () => {
        expect(hasPermission("MODERATOR", "admin_users:view")).toBe(false);
      });

      it("should deny admin_users:create", () => {
        expect(hasPermission("MODERATOR", "admin_users:create")).toBe(false);
      });

      it("should deny admin_users:delete", () => {
        expect(hasPermission("MODERATOR", "admin_users:delete")).toBe(false);
      });

      it("should deny settings:update", () => {
        expect(hasPermission("MODERATOR", "settings:update")).toBe(false);
      });

      it("should deny settings:delete", () => {
        expect(hasPermission("MODERATOR", "settings:delete")).toBe(false);
      });
    });

    describe("ADMIN", () => {
      it("should inherit MODERATOR permissions", () => {
        expect(hasPermission("ADMIN", "dashboard:view")).toBe(true);
        expect(hasPermission("ADMIN", "users:view")).toBe(true);
        expect(hasPermission("ADMIN", "audit_logs:view")).toBe(true);
        expect(hasPermission("ADMIN", "profile:view")).toBe(true);
        expect(hasPermission("ADMIN", "profile:update")).toBe(true);
      });

      it("should allow admin_users:view", () => {
        expect(hasPermission("ADMIN", "admin_users:view")).toBe(true);
      });

      it("should allow admin_users:create", () => {
        expect(hasPermission("ADMIN", "admin_users:create")).toBe(true);
      });

      it("should allow admin_users:update", () => {
        expect(hasPermission("ADMIN", "admin_users:update")).toBe(true);
      });

      it("should allow users:create", () => {
        expect(hasPermission("ADMIN", "users:create")).toBe(true);
      });

      it("should allow users:update", () => {
        expect(hasPermission("ADMIN", "users:update")).toBe(true);
      });

      it("should allow users:deactivate", () => {
        expect(hasPermission("ADMIN", "users:deactivate")).toBe(true);
      });

      it("should allow audit_logs:create", () => {
        expect(hasPermission("ADMIN", "audit_logs:create")).toBe(true);
      });

      it("should allow settings:view", () => {
        expect(hasPermission("ADMIN", "settings:view")).toBe(true);
      });

      it("should allow settings:update", () => {
        expect(hasPermission("ADMIN", "settings:update")).toBe(true);
      });

      it("should deny admin_users:delete", () => {
        expect(hasPermission("ADMIN", "admin_users:delete")).toBe(false);
      });

      it("should deny settings:delete", () => {
        expect(hasPermission("ADMIN", "settings:delete")).toBe(false);
      });
    });

    describe("SUPER_ADMIN", () => {
      it("should inherit all ADMIN permissions", () => {
        expect(hasPermission("SUPER_ADMIN", "dashboard:view")).toBe(true);
        expect(hasPermission("SUPER_ADMIN", "admin_users:view")).toBe(true);
        expect(hasPermission("SUPER_ADMIN", "admin_users:create")).toBe(true);
        expect(hasPermission("SUPER_ADMIN", "admin_users:update")).toBe(true);
        expect(hasPermission("SUPER_ADMIN", "users:view")).toBe(true);
        expect(hasPermission("SUPER_ADMIN", "users:create")).toBe(true);
        expect(hasPermission("SUPER_ADMIN", "audit_logs:view")).toBe(true);
        expect(hasPermission("SUPER_ADMIN", "audit_logs:create")).toBe(true);
        expect(hasPermission("SUPER_ADMIN", "settings:view")).toBe(true);
        expect(hasPermission("SUPER_ADMIN", "settings:update")).toBe(true);
        expect(hasPermission("SUPER_ADMIN", "profile:view")).toBe(true);
        expect(hasPermission("SUPER_ADMIN", "profile:update")).toBe(true);
      });

      it("should allow admin_users:delete", () => {
        expect(hasPermission("SUPER_ADMIN", "admin_users:delete")).toBe(true);
      });

      it("should allow settings:delete", () => {
        expect(hasPermission("SUPER_ADMIN", "settings:delete")).toBe(true);
      });
    });
  });

  // ─── getPermissions ─────────────────────────────────────────────────────
  describe("getPermissions", () => {
    it("should return MODERATOR permissions", () => {
      const perms = getPermissions("MODERATOR");
      expect(perms).toContain("dashboard:view");
      expect(perms).toContain("users:view");
      expect(perms).toContain("audit_logs:view");
      expect(perms).toContain("profile:view");
      expect(perms).toContain("profile:update");
      expect(perms).not.toContain("admin_users:view");
      expect(perms).not.toContain("admin_users:delete");
    });

    it("should return ADMIN permissions (including inherited MODERATOR)", () => {
      const perms = getPermissions("ADMIN");
      expect(perms).toContain("dashboard:view");
      expect(perms).toContain("admin_users:view");
      expect(perms).toContain("admin_users:create");
      expect(perms).toContain("admin_users:update");
      expect(perms).toContain("settings:view");
      expect(perms).toContain("settings:update");
      expect(perms).not.toContain("admin_users:delete");
      expect(perms).not.toContain("settings:delete");
    });

    it("should return all permissions for SUPER_ADMIN", () => {
      const perms = getPermissions("SUPER_ADMIN");
      expect(perms).toContain("admin_users:delete");
      expect(perms).toContain("settings:delete");
      expect(perms.length).toBeGreaterThanOrEqual(15);
    });

    it("should not contain duplicate permissions", () => {
      const perms = getPermissions("SUPER_ADMIN");
      expect(new Set(perms).size).toBe(perms.length);
    });
  });

  // ─── getRoleLevel ───────────────────────────────────────────────────────
  describe("getRoleLevel", () => {
    it("should return correct levels", () => {
      expect(getRoleLevel("MODERATOR")).toBe(3);
      expect(getRoleLevel("ADMIN")).toBe(6);
      expect(getRoleLevel("SUPER_ADMIN")).toBe(7);
    });

    it("should return 0 for unknown role", () => {
      expect(getRoleLevel("UNKNOWN" as AdminRole)).toBe(0);
    });
  });
});
