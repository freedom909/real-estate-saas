// src/wisdom-web/app/permission/permission.ts

import { Role } from "./role";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {

ADMIN: [

"listing.create",

"listing.update",

"listing.delete",

"user.manage",

"booking.manage",

],

OWNER: [

"listing.create",

"listing.update",

"booking.manage",

],

AGENT: [

"listing.create",

"listing.update",

],

CUSTOMER: [],

};