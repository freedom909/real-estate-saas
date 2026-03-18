// src/subgraphs/user/resolvers/index.ts

import UserService from "../../../application/user/services/user.service";
import { Action, Resource } from "../../../domain/user/types/types";

import UserModel, { IUserDB } from "../models/user.model.js";
import { ForbiddenError } from "../../../infrastructure/utils/errors";
import { container } from "tsyringe";
import PolicyEngine from "../../../security/policy.engine";
import userService from "../services/user.service.js";
import mongoose from "mongoose";
import { TOKENS_SECURITY } from "../../../security/container/security.tokens.js";
import { TOKENS_USER} from "../../../modules/user/container/user.tokens.js";

interface ResolverContext {
  container: typeof container;
  services: any;
  user?: any;
}

interface UserReference {
  id: string;
  __typename?: string;
}

// user.resolver.ts

const resolvers = {

  User: {
    __resolveReference: async (ref: UserReference, { userService }: any) => {
      return await userService.findById(ref.id);
    },
  },
  Query: {
    user: async (_: unknown, { id }: { id: string }, { user }: ResolverContext) => {
      const policyEngine = container.resolve<PolicyEngine>(TOKENS_SECURITY.security.policyEngine);
      const userService = container.resolve<UserService>(TOKENS_USER.services.userService);//
      
      const targetUser = await userService.findById(id);

      if (!targetUser) {
        return null
      }

      const policyContext = {
        user: user ? { id: user.id, role: user.role } : undefined,
        resourceOwnerId: targetUser._id.toString()
      }
      const allowed = policyEngine.can(Action.READ,
        Resource.USER, {
        user: policyContext.user ?? undefined,
        resourceOwnerId: targetUser._id.toString(),
      })
      if (!allowed) {
        throw new ForbiddenError("Access denied");
      }
      return targetUser;
    },

    userByEmail: async (_: unknown, { email }: { email: string }) => {
      const userService = container.resolve<UserService>(TOKENS_USER.services.userService);
      return userService.userByEmail(email);
    },
  },

  Mutation: {
    deactivateUser: async (
      _: unknown,
      { userId }: { userId: string }
    ) => {
      const userService = container.resolve<UserService>(TOKENS_USER.services.userService);
      return userService.deactivate(userId);
    },

createOAuthUser: async (_: any, { input }: any) => {

  console.log("🔥 createOAuthUser input =", input);

  const tenantId = input.tenantId
    ? new mongoose.Types.ObjectId(input.tenantId)
    : null;

  const user = await UserModel.create({
    tenantId,
    email: input.email || "unknown",
    name: input.profile?.name || "unknown",
    avatar: input.profile?.avatar || "",
    role: "CUSTOMER"
  });
  return user;
},
    updateLastLogin: async (_: unknown, { userId }: { userId: string }) => {

      const user = await UserModel.findByIdAndUpdate(
        userId,
        { lastLoginAt: new Date() },
      { new: true  }
      )

      return !!user
    }
  },


}

export default resolvers;