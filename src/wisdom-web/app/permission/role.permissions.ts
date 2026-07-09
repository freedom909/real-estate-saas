// src/permission/role.permissions.ts
import { Role } from "./role";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {

ADMIN: ["listing.create", "listing.delete", "user.manage"],

OWNER: ["listing.create", "listing.update"],

AGENT: ["listing.create"],

CUSTOMER: [],

};