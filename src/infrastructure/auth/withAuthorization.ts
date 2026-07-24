import { GraphQLError } from "graphql";
import { Action, Resource } from "@/core/user/domain/entities/types";
import PolicyEngine from "@/rbac/policy.engine";
import { Role } from "@/core/shared/domain/role";

/**
 * Resolver wrapper that enforces resource-level authorization via the policy engine.
 *
 * Usage:
 *   export const resolvers = {
 *     Query: {
 *       booking: withAuthorization(Action.READ, Resource.BOOKING, async (_, { id }, ctx) => {
 *         // ... existing resolver logic
 *       }, { resolveOwnerId: async (ctx, args) => findBookingOwner(args.id) }),
 *     },
 *   };
 */
export function withAuthorization<TArgs = any>(
  action: Action,
  resource: Resource,
  resolverFn: (parent: any, args: TArgs, context: any, info: any) => Promise<any>,
  options?: {
    /**
     * Optional: resolve the resource owner ID from args/context.
     * If provided, the policy engine checks resource ownership.
     */
    resolveOwnerId?: (context: any, args: TArgs) => Promise<string | null>;
  }
) {
  return async (parent: any, args: TArgs, context: any, info: any) => {
    const user = context.user;
    if (!user?.userId) {
      throw new GraphQLError("Unauthenticated", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }

    const engine = new PolicyEngine();
    const resourceOwnerId = options?.resolveOwnerId
      ? await options.resolveOwnerId(context, args)
      : undefined;

    const allowed = engine.can(action, resource, {
      user: {
        id: user.userId,
        role: user.role ?? Role.CUSTOMER,
      },
      resourceOwnerId,
    });

    if (!allowed) {
      throw new GraphQLError("Forbidden: insufficient permissions", {
        extensions: { code: "FORBIDDEN", action, resource },
      });
    }

    return resolverFn(parent, args, context, info);
  };
}
