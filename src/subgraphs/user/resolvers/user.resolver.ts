// src/subgraphs/user/resolvers/index.ts

import UserModel, { IUserDB } from "../models/user.model.js";
import { container } from "tsyringe";

import UserService from "../services/user.service.js";
import mongoose from "mongoose";
import { TOKENS_USER } from "../../../modules/tokens/user.tokens.js";
import verifyInternalRequest from "./verifyInternalRequest.js";
import CreateOAuthUserUseCase from "../application/usecase/createOAuthUserUseCase.js";
import { TenantACL } from "@/core/account/infra/tenant.acl.js";
import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens.js";
import { TOKENS_ACCOUNT } from "@/modules/tokens/account.token.js";


interface ResolverContext {
  container: typeof container;
  user?: any;
  req: any;
}

interface UserReference {
  id: string;
  __typename?: string;
}

// user.resolver.ts

const resolvers = {

Customer: {
  __resolveReference: async (
    ref: UserReference,
    { container }: ResolverContext
  ) => {
console.log(
 "🔥🔥 USER REFERENCE CALLED",
 ref
);
    console.log(
      "🔥 Customer __resolveReference",
      ref
    );

    const userService =
      container.resolve<UserService>(
        TOKENS_USER.services.userService
      );

    const customer =
      await userService.findById(ref.id);

    console.log(
      "🔥 Customer Found",
      customer
    );

    return customer;
  },
},
User: {
  __resolveReference: async (
    reference: UserReference,
    { container }: ResolverContext
  ) => {
    const userService = container.resolve<UserService>(
        TOKENS_USER.services.userService
      );
    const user =await userService.findById(reference.id);
    return user;
  },

},
  Query: {
    me: (_: any, __: any, ctx: any) => {
      if (!ctx.user) {
        throw new Error("UNAUTHORIZED");
      }

      return ctx.user;
    },
    user: async (_: unknown, { id }: { id: string }) => {
      const userService = container.resolve<UserService>(TOKENS_USER.services.userService);
        const user = await userService.findById(id);
       console.log(
    "🔥🔥 USER FIND RESULT:",
    user
  );
      return user
    },

    // Admin: list all users
    users: async (_: unknown, { limit = 50, offset = 0 }: { limit?: number; offset?: number }) => {
      const userService = container.resolve<UserService>(TOKENS_USER.services.userService);
      return userService.findAll(limit, offset);
    },

    // Admin: count all users
    userCount: async () => {
      const userService = container.resolve<UserService>(TOKENS_USER.services.userService);
      return userService.count();
    },

    userByEmail: async (
      _: unknown,
      { email }: { email: string },
      { req }: ResolverContext
    ) => {
      if (!req) {
        console.error("CRITICAL: Request object missing from context.");
        throw new Error("Internal Server Error: Context setup failure");
      }

      verifyInternalRequest(req);

      const userService = container.resolve<UserService>(TOKENS_USER.services.userService);
      return userService.userByEmail(email);
    }
  },

  Mutation: {
    deactivateUser: async (
      _: unknown,
      { userId }: { userId: string }
    ) => {
      const userService = container.resolve<UserService>(TOKENS_USER.services.userService);
      return userService.deactivate(userId);
    },

    createUser: async (_: any, { input }: any) => {
      const userService = container.resolve<UserService>(TOKENS_USER.services.userService);
      return userService.create(input);
    },

createOAuthUser: async (_: any, { input }: any) => {

const useCase = container.resolve<CreateOAuthUserUseCase>(TOKENS_USER.usecase.createOAuthUserUseCase);
console.log(
    "🔥🔥 CREATE OAUTH USER CALLED",
    input
  );
return await useCase.execute(input);
}
    // updateLastLogin: async (_: unknown, { userId }: { userId: string }) => {

    //   const user = await UserModel.findByIdAndUpdate(
    //     userId, // 型を変換
    //     { lastLoginAt: new Date() },
    //     { new: true }
    //   )
    //   return !!user
    // }
  },


}

export default resolvers;

function assertSelfAccess(requestUser: any, targetUserId: string) {
  if (!requestUser) {
    throw new Error("Unauthenticated");
  }

  if (requestUser.id !== targetUserId) {
    throw new Error("Forbidden");
  }
}
