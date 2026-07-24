// src/subgraphs/admin/guards/adminRole.guard.ts

import { GraphQLError } from "graphql";
import { container } from "tsyringe";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";
import { IAdminUserRepository } from "@/core/admin/domain/entities/IAdminUserRepository";
import { Role, hasMinRole } from "@/core/shared/domain/role";
import { hasPermission, Permission, getPermissions } from "./adminPermissions";

export type { Permission };

/**
 * GraphQL resolver guard — checks if the authenticated user is an admin
 * with at least the required role level.
 */
export function requireAdminRole(minRole: Role = Role.ADMIN) {
  return async (
    _: any,
    __: any,
    context: any,
    next: Function
  ) => {
    const user = context.user;

    if (!user?.userId) {
      throw new GraphQLError("Unauthenticated", { extensions: { code: "UNAUTHENTICATED" } });
    }

    const adminRepo = container.resolve<IAdminUserRepository>(
      TOKENS_ADMIN.repos.adminUserRepository
    );

    const admin = await adminRepo.findById(user.userId);

    if (!admin) {
      throw new GraphQLError("Forbidden: Admin access required", {
        extensions: { code: "FORBIDDEN" },
      });
    }

    if ((admin as any).status !== "ACTIVE") {
      throw new GraphQLError(
        `Account is ${(admin as any).status}`,
        { extensions: { code: "FORBIDDEN" } }
      );
    }

    const adminRole = (admin as any).role as Role;
    if (!hasMinRole(adminRole, minRole)) {
      throw new GraphQLError(
        `Forbidden: Requires ${minRole} role or higher`,
        { extensions: { code: "FORBIDDEN" } }
      );
    }

    // Attach admin info to context for downstream resolvers
    context.admin = {
      id: admin.id,
      role: adminRole,
      email: admin.email,
      permissions: getPermissions(adminRole),
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
      throw new GraphQLError("Unauthenticated", { extensions: { code: "UNAUTHENTICATED" } });
    }

    const adminRepo = container.resolve<IAdminUserRepository>(
      TOKENS_ADMIN.repos.adminUserRepository
    );

    const admin = await adminRepo.findById(user.userId);

    if (!admin) {
      throw new GraphQLError("Forbidden: Admin access required", {
        extensions: { code: "FORBIDDEN" },
      });
    }

    if (!(admin as any).isActive) {
      throw new GraphQLError("Forbidden: Admin account is inactive", {
        extensions: { code: "FORBIDDEN" },
      });
    }

    const role = (admin as any).role as Role;

    if (!hasPermission(role, permission)) {
      throw new GraphQLError(
        `Forbidden: Missing permission "${permission}"`,
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
