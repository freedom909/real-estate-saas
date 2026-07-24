// src/permission/role.ts
// Unified Role enum — keep in sync with src/core/shared/domain/role.ts

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
