// src/rbac/policy.engine.ts

import { IPolicy, PolicyContext } from "@/core/user/domain/entities/policyContext";
import { Action, Resource } from "@/core/user/domain/entities/types";
import { Role, hasMinRole } from "@/core/shared/domain/role";

type PolicyHandler = (context: PolicyContext) => boolean;

export default class PolicyEngine implements IPolicy {
  private policies: Record<string, PolicyHandler>;

  constructor() {
    this.policies = {
      // -------------------
      // USER 资源规则
      // -------------------

      [`${Action.READ}_${Resource.USER}`]: (ctx) => {
        if (!ctx.user) return false;
        if (hasMinRole(ctx.user.role, Role.ADMIN)) return true;
        return ctx.user.id === ctx.resourceOwnerId;
      },

      [`${Action.UPDATE}_${Resource.USER}`]: (ctx) => {
        if (!ctx.user) return false;
        if (hasMinRole(ctx.user.role, Role.ADMIN)) return true;
        return ctx.user.id === ctx.resourceOwnerId;
      },

      [`${Action.DELETE}_${Resource.USER}`]: (ctx) => {
        if (!ctx.user) return false;
        return hasMinRole(ctx.user.role, Role.SUPER_ADMIN);
      },

      // -------------------
      // LISTING 资源规则
      // -------------------

      [`${Action.READ}_${Resource.LISTING}`]: () => true,

      [`${Action.CREATE}_${Resource.LISTING}`]: (ctx) => {
        if (!ctx.user) return false;
        return hasMinRole(ctx.user.role, Role.AGENT);
      },

      [`${Action.UPDATE}_${Resource.LISTING}`]: (ctx) => {
        if (!ctx.user) return false;
        if (hasMinRole(ctx.user.role, Role.ADMIN)) return true;
        return ctx.user.id === ctx.resourceOwnerId;
      },

      // -------------------
      // BOOKING 资源规则
      // -------------------

      [`${Action.READ}_${Resource.BOOKING}`]: (ctx) => {
        if (!ctx.user) return false;
        if (hasMinRole(ctx.user.role, Role.ADMIN)) return true;
        return ctx.user.id === ctx.resourceOwnerId;
      },

      [`${Action.CREATE}_${Resource.BOOKING}`]: (ctx) => {
        if (!ctx.user) return false;
        return hasMinRole(ctx.user.role, Role.CUSTOMER);
      },

      [`${Action.UPDATE}_${Resource.BOOKING}`]: (ctx) => {
        if (!ctx.user) return false;
        if (hasMinRole(ctx.user.role, Role.ADMIN)) return true;
        return ctx.user.id === ctx.resourceOwnerId;
      },

      // -------------------
      // PAYMENT 资源规则
      // -------------------

      [`${Action.READ}_${Resource.PAYMENT}`]: (ctx) => {
        if (!ctx.user) return false;
        if (hasMinRole(ctx.user.role, Role.ADMIN)) return true;
        return ctx.user.id === ctx.resourceOwnerId;
      },

      [`${Action.CREATE}_${Resource.PAYMENT}`]: (ctx) => {
        if (!ctx.user) return false;
        return hasMinRole(ctx.user.role, Role.CUSTOMER);
      },

      [`${Action.UPDATE}_${Resource.PAYMENT}`]: (ctx) => {
        if (!ctx.user) return false;
        if (hasMinRole(ctx.user.role, Role.ADMIN)) return true;
        return ctx.user.id === ctx.resourceOwnerId;
      },

      // -------------------
      // REVIEW 资源规则
      // -------------------

      [`${Action.READ}_${Resource.REVIEW}`]: () => true,

      [`${Action.CREATE}_${Resource.REVIEW}`]: (ctx) => {
        if (!ctx.user) return false;
        return hasMinRole(ctx.user.role, Role.CUSTOMER);
      },

      [`${Action.UPDATE}_${Resource.REVIEW}`]: (ctx) => {
        if (!ctx.user) return false;
        if (hasMinRole(ctx.user.role, Role.ADMIN)) return true;
        return ctx.user.id === ctx.resourceOwnerId;
      },

      [`${Action.DELETE}_${Resource.REVIEW}`]: (ctx) => {
        if (!ctx.user) return false;
        return hasMinRole(ctx.user.role, Role.ADMIN);
      },
    };
  }

  can(action: Action, resource: Resource, context: PolicyContext): boolean {
    const { user, resourceOwnerId } = context;

    if (!user) return false;

    // Super admin bypass
    if (user.role === Role.SUPER_ADMIN) return true;

    // Check specific policy
    const key = `${action}_${resource}`;
    const handler = this.policies[key];
    if (handler) return handler(context);

    // Default: deny
    return false;
  }
}
