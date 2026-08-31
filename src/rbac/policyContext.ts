import { Role } from "@/core/shared/domain/role";

import { Action, Resource } from "@/rbac/types";

export interface PolicyContext {
  user: PolicyUser | null;
  resourceOwnerId?: string;
  resource?: any;
}

export interface IPolicyEngine {
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