// src/security/policy.engine.ts

import { IPolicy, PolicyContext } from "@/domain/user/types/policyContext";
import { Action, Resource } from "@/domain/user/types/types";
import { Role } from "@/domain/user/types/role";

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

        if (ctx.user.role === Role.ADMIN) return true;

        return ctx.user.id === ctx.resourceOwnerId;
      },

      [`${Action.UPDATE}_${Resource.USER}`]: (ctx) => {
        if (!ctx.user) return false;

        if (ctx.user.role === Role.ADMIN) return true;

        return ctx.user.id === ctx.resourceOwnerId;
      },

      [`${Action.DELETE}_${Resource.USER}`]: (ctx) => {
        if (!ctx.user) return false;

        return ctx.user.role === Role.ADMIN;
      },

      // -------------------
      // LISTING 资源规则
      // -------------------

      [`${Action.READ}_${Resource.LISTING}`]: (ctx) => {
        if (!ctx.user) return false;

        if (ctx.user.role === Role.ADMIN) return true;

        return true; // 所有人都可读 listing
      },

      [`${Action.UPDATE}_${Resource.LISTING}`]: (ctx) => {
        if (!ctx.user) return false;

        if (ctx.user.role === Role.ADMIN) return true;

        return ctx.user.id === ctx.resourceOwnerId;
      },

      // -------------------
      // BOOKING 资源规则
      // -------------------

      [`${Action.CREATE}_${Resource.BOOKING}`]: (ctx) => {
        if (!ctx.user) return false;
        return ctx.user.role === Role.CUSTOMER;
      },

    };
  }

  can(
    action: Action,
    resource: Resource,
    context: PolicyContext
  ): boolean {

    const { user, resourceOwnerId } = context;

    if (!user) {
      return false;
    }

    // 1️⃣ 超级管理员
    if (user.role === Role.ADMIN) {
      return true;
    }

    // 2️⃣ 资源所有者访问
    if (
      action === Action.READ &&
      resourceOwnerId &&
      user.id === resourceOwnerId
    ) {
      return true;
    }

    return false;
  }
}


