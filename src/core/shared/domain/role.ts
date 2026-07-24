/**
 * Unified role enum used across all subgraphs, GraphQL schemas, and frontend.
 *
 * Hierarchy (lowest to highest):
 *   GUEST < CUSTOMER < STAFF < MODERATOR < AGENT < OWNER < ADMIN < SUPER_ADMIN
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
}

/**
 * Numeric hierarchy for comparison. Higher = more privileged.
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.GUEST]: 0,
  [Role.CUSTOMER]: 1,
  [Role.STAFF]: 2,
  [Role.MODERATOR]: 3,
  [Role.AGENT]: 4,
  [Role.OWNER]: 5,
  [Role.ADMIN]: 6,
  [Role.SUPER_ADMIN]: 7,
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
export function mapLegacyRole(legacy: string): Role {
  const map: Record<string, Role> = {
    SUPER_ADMIN: Role.SUPER_ADMIN,
    ADMIN: Role.ADMIN,
    STAFF: Role.STAFF,
    AGENT: Role.AGENT,
    CUSTOMER: Role.CUSTOMER,
    USER: Role.CUSTOMER,
    OWNER: Role.OWNER,
    MEMBER: Role.CUSTOMER,
    TENANT_ADMIN: Role.ADMIN,
    MODERATOR: Role.MODERATOR,
  };
  return map[legacy] ?? Role.CUSTOMER;
}
