////src/modules/audit/domain/enums/audit.enums.ts

export const AUDIT_STATUS = [
  "SUCCESS",
  "FAILED",
  "PENDING",
    "LOGIN_SUCCESS",
  "LOGIN_FAILED",
  "LOGOUT",
  "TOKEN_REFRESH",
  "LISTING_CREATED",
  "LISTING_UPDATED",
  "LISTING_DELETED",
  "LISTING_PUBLISHED",
  "LISTING_UNPUBLISHED",
] as const

export type AuditStatus =
  typeof AUDIT_STATUS[number];