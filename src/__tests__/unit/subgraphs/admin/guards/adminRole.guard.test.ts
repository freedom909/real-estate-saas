// @ts-nocheck
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { GraphQLError } from "graphql";

// Mock dependencies
const mockAdminRepo = {
  findById: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  countByRole: jest.fn(),
};

jest.mock("@/modules/tokens/admin.tokens", () => ({
  TOKENS_ADMIN: {
    repos: { adminUserRepository: Symbol.for("AdminUserRepository") },
  },
}));

jest.mock("@/subgraphs/admin/guards/adminPermissions", () => {
  const ROLE_HIERARCHY: Record<string, number> = { MODERATOR: 1, ADMIN: 2, SUPER_ADMIN: 3 };
  const ROLE_PERMISSIONS: Record<string, string[]> = {
    MODERATOR: ["dashboard:view", "users:view", "audit_logs:view", "profile:view", "profile:update"],
    ADMIN: ["admin_users:view", "admin_users:create", "admin_users:update", "users:create", "users:update", "users:deactivate", "audit_logs:create", "settings:view", "settings:update"],
    SUPER_ADMIN: ["admin_users:delete", "settings:delete"],
  };

  return {
    AdminRole: { MODERATOR: "MODERATOR", ADMIN: "ADMIN", SUPER_ADMIN: "SUPER_ADMIN" },
    hasPermission: jest.fn((role: string, perm: string) => {
      const roleLevel = ROLE_HIERARCHY[role] ?? 0;
      for (const [roleName, level] of Object.entries(ROLE_HIERARCHY)) {
        if (level <= roleLevel && ROLE_PERMISSIONS[roleName]?.includes(perm)) return true;
      }
      return false;
    }),
    getPermissions: jest.fn((role: string) => {
      const roleLevel = ROLE_HIERARCHY[role] ?? 0;
      const all: string[] = [];
      for (const [roleName, level] of Object.entries(ROLE_HIERARCHY)) {
        if (level <= roleLevel) all.push(...(ROLE_PERMISSIONS[roleName] ?? []));
      }
      return [...new Set(all)];
    }),
  };
});

jest.mock("tsyringe", () => ({
  container: {
    resolve: jest.fn(() => mockAdminRepo),
  },
}));

import { requireAdminRole, requirePermission } from "@/subgraphs/admin/guards/adminRole.guard";
import { container } from "tsyringe";

describe("adminRole.guard", () => {
  beforeEach(() => jest.clearAllMocks());

  const nextFn = jest.fn();

  // ─── requireAdminRole ────────────────────────────────────────────────────
  describe("requireAdminRole", () => {
    it("should throw UNAUTHORIZED when no user in context", async () => {
      const guard = requireAdminRole("ADMIN");

      await expect(
        guard(null, null, {}, nextFn)
      ).rejects.toThrow("Unauthenticated");
    });

    it("should throw UNAUTHORIZED when user has no userId", async () {
      const guard = requireAdminRole("ADMIN");

      await expect(
        guard(null, null, { user: {} }, nextFn)
      ).rejects.toThrow("Unauthenticated");
    });

    it("should throw FORBIDDEN when admin not found", async () => {
      mockAdminRepo.findById.mockResolvedValue(null);
      const guard = requireAdminRole("ADMIN");

      await expect(
        guard(null, null, { user: { userId: "u1" } }, nextFn)
      ).rejects.toThrow("Forbidden: Admin access required");
    });

    it("should throw FORBIDDEN when admin account is not ACTIVE", async () => {
      mockAdminRepo.findById.mockResolvedValue({ id: "a1", role: "ADMIN", status: "SUSPENDED" });
      const guard = requireAdminRole("ADMIN");

      await expect(
        guard(null, null, { user: { userId: "a1" } }, nextFn)
      ).rejects.toThrow("Account is SUSPENDED");
    });

    it("should throw FORBIDDEN when role is too low", async () => {
      mockAdminRepo.findById.mockResolvedValue({ id: "a1", role: "MODERATOR", status: "ACTIVE" });
      const guard = requireAdminRole("ADMIN");

      await expect(
        guard(null, null, { user: { userId: "a1" } }, nextFn)
      ).rejects.toThrow("Forbidden: Requires ADMIN role or higher");
    });

    it("should call next() and attach admin to context when authorized", async () => {
      mockAdminRepo.findById.mockResolvedValue({ id: "a1", email: "a@test.com", role: "ADMIN", status: "ACTIVE" });
      const context: any = { user: { userId: "a1" } };
      const guard = requireAdminRole("ADMIN");

      await guard(null, null, context, nextFn);

      expect(nextFn).toHaveBeenCalled();
      expect(context.admin).toBeDefined();
      expect(context.admin.id).toBe("a1");
      expect(context.admin.role).toBe("ADMIN");
    });

    it("should allow SUPER_ADMIN when minRole is ADMIN", async () => {
      mockAdminRepo.findById.mockResolvedValue({ id: "a1", email: "a@test.com", role: "SUPER_ADMIN", status: "ACTIVE" });
      const context: any = { user: { userId: "a1" } };
      const guard = requireAdminRole("ADMIN");

      await guard(null, null, context, nextFn);

      expect(nextFn).toHaveBeenCalled();
    });

    it("should use ADMIN as default minRole", async () => {
      mockAdminRepo.findById.mockResolvedValue({ id: "a1", email: "a@test.com", role: "ADMIN", status: "ACTIVE" });
      const context: any = { user: { userId: "a1" } };
      const guard = requireAdminRole();

      await guard(null, null, context, nextFn);

      expect(nextFn).toHaveBeenCalled();
    });
  });

  // ─── requirePermission ──────────────────────────────────────────────────
  describe("requirePermission", () => {
    it("should throw UNAUTHORIZED when no user", async () => {
      const guard = requirePermission("admin_users:view");

      await expect(
        guard(null, null, {}, nextFn)
      ).rejects.toThrow("Unauthenticated");
    });

    it("should throw FORBIDDEN when admin not found", async () => {
      mockAdminRepo.findById.mockResolvedValue(null);
      const guard = requirePermission("admin_users:view");

      await expect(
        guard(null, null, { user: { userId: "u1" } }, nextFn)
      ).rejects.toThrow("Forbidden: Admin access required");
    });

    it("should throw FORBIDDEN when admin is inactive", async () => {
      mockAdminRepo.findById.mockResolvedValue({ id: "a1", role: "ADMIN", isActive: false });
      const guard = requirePermission("admin_users:view");

      await expect(
        guard(null, null, { user: { userId: "a1" } }, nextFn)
      ).rejects.toThrow("Forbidden: Admin account is inactive");
    });

    it("should throw FORBIDDEN when missing permission", async () => {
      mockAdminRepo.findById.mockResolvedValue({ id: "a1", role: "MODERATOR", isActive: true });
      const guard = requirePermission("admin_users:delete");

      await expect(
        guard(null, null, { user: { userId: "a1" } }, nextFn)
      ).rejects.toThrow('Forbidden: Missing permission "admin_users:delete"');
    });

    it("should call next() and attach admin when permission granted", async () => {
      mockAdminRepo.findById.mockResolvedValue({ id: "a1", email: "a@test.com", role: "ADMIN", isActive: true });
      const context: any = { user: { userId: "a1" } };
      const guard = requirePermission("admin_users:view");

      await guard(null, null, context, nextFn);

      expect(nextFn).toHaveBeenCalled();
      expect(context.admin.id).toBe("a1");
      expect(context.admin.role).toBe("ADMIN");
    });
  });
});
