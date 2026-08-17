/**
 * Unified role enum used across all subgraphs, GraphQL schemas, and frontend.
 *
 * Hierarchy (lowest to highest):
 *   GUEST < CUSTOMER < STAFF < MODERATOR < HOST < AGENT < OWNER < ADMIN < SUPER_ADMIN
 */
export enum Role {
  GUEST = "GUEST",
  CUSTOMER = "CUSTOMER",
  STAFF = "STAFF",
  MODERATOR = "MODERATOR",
  AGENT = "AGENT",
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
  HOST = "HOST",
}

/**
 * Numeric hierarchy for comparison. Higher = more privileged.
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.GUEST]: 0,
  [Role.CUSTOMER]: 1,
  [Role.STAFF]: 2,
  [Role.MODERATOR]: 3,
  [Role.HOST]: 4,
  [Role.AGENT]: 5,
  [Role.OWNER]: 6,
  [Role.ADMIN]: 7,
  [Role.SUPER_ADMIN]: 8,
 
};

/**
 * Check if `userRole` has at least `requiredRole` privilege.
 */
export function hasMinRole(userRole: Role, requiredRole: Role): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole]);
}

/**
 * Map legacy role strings to the unified Role enum.
 * Use during migration; delete once all data is normalized.
 */
export function normalizeRole(value: string): Role {
  const normalized = value.trim().toUpperCase();

  const map: Record<string, Role> = {
    // Current roles
    GUEST: Role.GUEST,
    CUSTOMER: Role.CUSTOMER,
    STAFF: Role.STAFF,
    MODERATOR: Role.MODERATOR,
    HOST: Role.HOST,
    AGENT: Role.AGENT,
    OWNER: Role.OWNER,
    ADMIN: Role.ADMIN,
    SUPER_ADMIN: Role.SUPER_ADMIN,

    // Legacy aliases
    USER: Role.CUSTOMER,
    MEMBER: Role.CUSTOMER,
    TENANT_ADMIN: Role.ADMIN,
  };

  return map[normalized] ?? Role.CUSTOMER;
}
