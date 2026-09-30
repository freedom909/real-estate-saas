import { Role } from "./role";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [Role.ADMIN]: [
    "listing.create",
    "listing.update",
    "listing.delete",
    "user.manage",
    "booking.manage",
  ],

  [Role.OWNER]: [
    "listing.create",
    "listing.update",
    "booking.manage",
  ],

  [Role.HOST]: [
    "listing.create",
    "listing.update",
  ],

  [Role.AGENT]: [
    "listing.create",
    "listing.update",
  ],

  [Role.CUSTOMER]: [],

  [Role.GUEST]: [],

  [Role.STAFF]: [],

  [Role.MODERATOR]: [],

  [Role.SUPER_ADMIN]: [
    "listing.create",
    "listing.update",
    "listing.delete",
    "user.manage",
    "booking.manage",
  ],
};