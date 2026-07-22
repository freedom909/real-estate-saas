// src/subgraphs/admin/guards/adminRole.guard.ts

import { GraphQLError } from "graphql";
import { container } from "tsyringe";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";
import { IAdminUserRepository } from "@/core/admin/domain/entities/IAdminUserRepository";
import { AdminRole, hasPermission, Permission, getPermissions } from "./adminPermissions";

export type { AdminRole, Permission };

const ROLE_HIERARCHY: Record<AdminRole, number> = {
  MODERATOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

/**
 * GraphQL resolver guard — checks if the authenticated user is an admin
 * with at least the required role level.
 */
export function requireAdminRole(minRole: AdminRole = "ADMIN") {
  return async (
    _: any,
    __: any,
    context: any,
    next: Function
  ) => {
    const user = context.user;

    if (!user?.userId) {
      throw new GraphQLError("UNAUTHORIZED", { extensions: { code: "UNAUTHORIZED" } });
    }

    const adminRepo = container.resolve<IAdminUserRepository>(
      TOKENS_ADMIN.repos.adminUserRepository
    );

    const admin = await adminRepo.findById(user.userId);

    if (!admin) {
      throw new GraphQLError("FORBIDDEN: Admin access required", {
        extensions: { code: "FORBIDDEN" },
      });
    }

    if (!(admin as any).isActive) {
      throw new GraphQLError("FORBIDDEN: Admin account is inactive", {
        extensions: { code: "FORBIDDEN" },
      });
    }

    const userLevel = ROLE_HIERARCHY[(admin as any).role] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;

    if (userLevel < requiredLevel) {
      throw new GraphQLError(
        `FORBIDDEN: Requires ${minRole} role or higher`,
        { extensions: { code: "FORBIDDEN" } }
      );
    }

    // Attach admin info to context for downstream resolvers
    context.admin = {
      id: admin.id,
      role: (admin as any).role,
      email: admin.email,
      permissions: getPermissions((admin as any).role),
    };

    return next();
  };
}

/**
 * GraphQL resolver guard — checks if the authenticated user has a specific permission.
 */
export function requirePermission(permission: Permission) {
  return async (
    _: any,
    __: any,
    context: any,
    next: Function
  ) => {
    const user = context.user;

    if (!user?.userId) {
      throw new GraphQLError("UNAUTHORIZED", { extensions: { code: "UNAUTHORIZED" } });
    }

    const adminRepo = container.resolve<IAdminUserRepository>(
      TOKENS_ADMIN.repos.adminUserRepository
    );

    const admin = await adminRepo.findById(user.userId);

    if (!admin) {
      throw new GraphQLError("FORBIDDEN: Admin access required", {
        extensions: { code: "FORBIDDEN" },
      });
    }

    if (!(admin as any).isActive) {
      throw new GraphQLError("FORBIDDEN: Admin account is inactive", {
        extensions: { code: "FORBIDDEN" },
      });
    }

    const role = (admin as any).role as AdminRole;

    if (!hasPermission(role, permission)) {
      throw new GraphQLError(
        `FORBIDDEN: Missing permission "${permission}"`,
        { extensions: { code: "FORBIDDEN", required: permission } }
      );
    }

    context.admin = {
      id: admin.id,
      role,
      email: admin.email,
      permissions: getPermissions(role),
    };

    return next();
  };
}
