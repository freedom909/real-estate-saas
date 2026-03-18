
import { Action, Resource } from "./types";
import { Role } from "./role";

export interface PolicyContext {
  user: PolicyUser | null;
  resourceOwnerId?: string;
  resource?: any;
}

export interface IPolicy {
  can(
    action: Action,
    resource: Resource,
    context: PolicyContext
  ): boolean;
}

export interface PolicyUser {
  id: string;
  role: Role;
}