// src/modules/audit/domain/value-objects/audit.types.ts


/* =========================================
   ENUMS
========================================= */

export const AUDIT_STATUS = [
  "SUCCESS",
  "FAILED",
  "PENDING",
] as const;

export type AuditStatus =
  typeof AUDIT_STATUS[number];

export const RESOURCE_TYPES = [
  "BOOKING",
  "LISTING",
  "PAYMENT",
  "USER",
  "OWNER",
  "TENANT",
  "AUTH",
  "REVIEW",
  "ADMIN",
] as const;

export type ResourceType =
  typeof RESOURCE_TYPES[number];

/* =========================================
   META
========================================= */

export interface AuditMeta {
  deviceId?: string;
  provider?: string;
  ip?: string;
  userAgent?: string;
}

/* =========================================
   DOCUMENT
========================================= */
