// src/subgraphs/admin/guards/adminPermissions.ts

/**
 * Role-based permissions matrix.
 * Each role has a set of allowed actions.
 * SUPER_ADMIN inherits all permissions from ADMIN and MODERATOR.
 */

export type AdminRole = "ADMIN" | "SUPER_ADMIN" | "MODERATOR";

export type Permission =
  // Dashboard
  | "dashboard:view"
  // Admin Users
  | "admin_users:view"
  | "admin_users:create"
  | "admin_users:update"
  | "admin_users:delete"
  // Platform Users
  | "users:view"
  | "users:create"
  | "users:update"
  | "users:deactivate"
  // Audit Logs
  | "audit_logs:view"
  | "audit_logs:create"
  // System Settings
  | "settings:view"
  | "settings:update"
  | "settings:delete"
  // Profile
  | "profile:view"
  | "profile:update"
  | "profile:change_password";

const ROLE_HIERARCHY: Record<AdminRole, number> = {
  MODERATOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  MODERATOR: [
    "dashboard:view",
    "users:view",
    "audit_logs:view",
    "profile:view",
    "profile:update",
    "profile:change_password",
  ],
  ADMIN: [
    // Inherits MODERATOR permissions plus:
    "admin_users:view",
    "admin_users:create",
    "admin_users:update",
    "users:create",
    "users:update",
    "users:deactivate",
    "audit_logs:create",
    "settings:view",
    "settings:update",
  ],
  SUPER_ADMIN: [
    // Inherits ADMIN permissions plus:
    "admin_users:delete",
    "settings:delete",
  ],
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: AdminRole, permission: Permission): boolean {
  const roleLevel = ROLE_HIERARCHY[role] ?? 0;

  // Check all roles at or below the user's level
  for (const [roleName, level] of Object.entries(ROLE_HIERARCHY)) {
    if (level <= roleLevel) {
      const perms = ROLE_PERMISSIONS[roleName as AdminRole] ?? [];
      if (perms.includes(permission)) return true;
    }
  }

  return false;
}

/**
 * Get all permissions for a role.
 */
export function getPermissions(role: AdminRole): Permission[] {
  const roleLevel = ROLE_HIERARCHY[role] ?? 0;
  const allPermissions: Permission[] = [];

  for (const [roleName, level] of Object.entries(ROLE_HIERARCHY)) {
    if (level <= roleLevel) {
      allPermissions.push(...(ROLE_PERMISSIONS[roleName as AdminRole] ?? []));
    }
  }

  return [...new Set(allPermissions)];
}

/**
 * Get the numeric level for a role.
 */
export function getRoleLevel(role: AdminRole): number {
  return ROLE_HIERARCHY[role] ?? 0;
}
