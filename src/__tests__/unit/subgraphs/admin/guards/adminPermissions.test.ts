import { describe, it, expect } from "@jest/globals";
import { Role } from "@/core/shared/domain/role";
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
        expect(hasPermission(Role.MODERATOR, "dashboard:view")).toBe(true);
      });

      it("should allow users:view", () => {
        expect(hasPermission(Role.MODERATOR, "users:view")).toBe(true);
      });

      it("should allow audit_logs:view", () => {
        expect(hasPermission(Role.MODERATOR, "audit_logs:view")).toBe(true);
      });

      it("should allow profile:view", () => {
        expect(hasPermission(Role.MODERATOR, "profile:view")).toBe(true);
      });

      it("should allow profile:update", () => {
        expect(hasPermission(Role.MODERATOR, "profile:update")).toBe(true);
      });

      it("should deny admin_users:view", () => {
        expect(hasPermission(Role.MODERATOR, "admin_users:view")).toBe(false);
      });

      it("should deny admin_users:create", () => {
        expect(hasPermission(Role.MODERATOR, "admin_users:create")).toBe(false);
      });

      it("should deny admin_users:delete", () => {
        expect(hasPermission(Role.MODERATOR, "admin_users:delete")).toBe(false);
      });

      it("should deny settings:update", () => {
        expect(hasPermission(Role.MODERATOR, "settings:update")).toBe(false);
      });

      it("should deny settings:delete", () => {
        expect(hasPermission(Role.MODERATOR, "settings:delete")).toBe(false);
      });
    });

    describe("ADMIN", () => {
      it("should inherit MODERATOR permissions", () => {
        expect(hasPermission(Role.ADMIN, "dashboard:view")).toBe(true);
        expect(hasPermission(Role.ADMIN, "users:view")).toBe(true);
        expect(hasPermission(Role.ADMIN, "audit_logs:view")).toBe(true);
        expect(hasPermission(Role.ADMIN, "profile:view")).toBe(true);
        expect(hasPermission(Role.ADMIN, "profile:update")).toBe(true);
      });

      it("should allow admin_users:view", () => {
        expect(hasPermission(Role.ADMIN, "admin_users:view")).toBe(true);
      });

      it("should allow admin_users:create", () => {
        expect(hasPermission(Role.ADMIN, "admin_users:create")).toBe(true);
      });

      it("should allow admin_users:update", () => {
        expect(hasPermission(Role.ADMIN, "admin_users:update")).toBe(true);
      });

      it("should allow users:create", () => {
        expect(hasPermission(Role.ADMIN, "users:create")).toBe(true);
      });

      it("should allow users:update", () => {
        expect(hasPermission(Role.ADMIN, "users:update")).toBe(true);
      });

      it("should allow users:deactivate", () => {
        expect(hasPermission(Role.ADMIN, "users:deactivate")).toBe(true);
      });

      it("should allow audit_logs:create", () => {
        expect(hasPermission(Role.ADMIN, "audit_logs:create")).toBe(true);
      });

      it("should allow settings:view", () => {
        expect(hasPermission(Role.ADMIN, "settings:view")).toBe(true);
      });

      it("should allow settings:update", () => {
        expect(hasPermission(Role.ADMIN, "settings:update")).toBe(true);
      });

      it("should deny admin_users:delete", () => {
        expect(hasPermission(Role.ADMIN, "admin_users:delete")).toBe(false);
      });

      it("should deny settings:delete", () => {
        expect(hasPermission(Role.ADMIN, "settings:delete")).toBe(false);
      });
    });

    describe("SUPER_ADMIN", () => {
      it("should inherit all ADMIN permissions", () => {
        expect(hasPermission(Role.SUPER_ADMIN, "dashboard:view")).toBe(true);
        expect(hasPermission(Role.SUPER_ADMIN, "admin_users:view")).toBe(true);
        expect(hasPermission(Role.SUPER_ADMIN, "admin_users:create")).toBe(true);
        expect(hasPermission(Role.SUPER_ADMIN, "settings:view")).toBe(true);
        expect(hasPermission(Role.SUPER_ADMIN, "settings:update")).toBe(true);
      });

      it("should allow admin_users:delete", () => {
        expect(hasPermission(Role.SUPER_ADMIN, "admin_users:delete")).toBe(true);
      });

      it("should allow settings:delete", () => {
        expect(hasPermission(Role.SUPER_ADMIN, "settings:delete")).toBe(true);
      });
    });
  });

  // ─── getPermissions ─────────────────────────────────────────────────────
  describe("getPermissions", () => {
    it("should return MODERATOR permissions", () => {
      const perms = getPermissions(Role.MODERATOR);
      expect(perms).toContain("dashboard:view");
      expect(perms).toContain("users:view");
      expect(perms).toContain("audit_logs:view");
      expect(perms).toContain("profile:view");
      expect(perms).toContain("profile:update");
    });

    it("should return ADMIN permissions (including inherited MODERATOR)", () => {
      const perms = getPermissions(Role.ADMIN);
      expect(perms).toContain("dashboard:view");
      expect(perms).toContain("admin_users:view");
      expect(perms).toContain("admin_users:create");
      expect(perms).toContain("settings:view");
    });

    it("should return all permissions for SUPER_ADMIN", () => {
      const perms = getPermissions(Role.SUPER_ADMIN);
      expect(perms).toContain("admin_users:delete");
      expect(perms).toContain("settings:delete");
    });

    it("should not contain duplicate permissions", () => {
      const perms = getPermissions(Role.SUPER_ADMIN);
      expect(new Set(perms).size).toBe(perms.length);
    });
  });

  // ─── getRoleLevel ───────────────────────────────────────────────────────
  describe("getRoleLevel", () => {
    it("should return correct levels", () => {
      expect(getRoleLevel(Role.MODERATOR)).toBe(3);
      expect(getRoleLevel(Role.ADMIN)).toBe(7);
      expect(getRoleLevel(Role.SUPER_ADMIN)).toBe(8);
    });

    it("should return 0 for unknown role", () => {
      expect(getRoleLevel("UNKNOWN" as AdminRole)).toBe(0);
    });
  });
});
