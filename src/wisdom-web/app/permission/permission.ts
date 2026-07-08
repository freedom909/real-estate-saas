// src/wisdom-web/app/permission/permission.ts


export const PERMISSIONS = {
  LISTING_CREATE: "listing:create",
  LISTING_EDIT: "listing:edit",
  LISTING_DELETE: "listing:delete",
  ADMIN_PANEL: "admin:panel",
} as const;

export const ROLE_PERMISSIONS = {
  guest: [],
  host: [
    "listing:create",
    "listing:edit",
    "listing:delete",
  ],
  admin: [
    "listing:create",
    "listing:edit",
    "listing:delete",
    "admin:panel",
  ],
};