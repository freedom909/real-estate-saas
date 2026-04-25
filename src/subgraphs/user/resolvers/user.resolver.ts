// src/subgraphs/user/resolvers/index.ts

import UserModel, { IUserDB } from "../models/user.model.js";
import { container } from "tsyringe";

import UserService from "../services/user.service.js";
import mongoose from "mongoose";
import { TOKENS_USER } from "../../../modules/tokens/user.tokens.js";
import verifyInternalRequest from "./verifyInternalRequest.js";


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

  User: {
    __resolveReference: async (ref: UserReference, { userService }: any) => {
      return await userService.findById(ref.id);
    },
  },
  Query: {
    user: async (_: unknown, { id }: { id: string }, { user }: { user: any }) => {
      if (!user || user.id !== id) {
        throw new Error("Forbidden");
      }
      const userService = container.resolve<UserService>(TOKENS_USER.services.userService);
      return userService.findById(id);
    },

    internalUserByEmail: async (
      _: unknown,
      { email }: { email: string },
      { req }: ResolverContext // Ensure req is always present in context
    ) => {
      if (!req) {
        console.error("CRITICAL: Request object missing from context.");
        // This should ideally not happen if context is set up correctly in index.ts
        throw new Error("Internal Server Error: Context setup failure");
      }

      // Use req.get() for reliable, case-insensitive header retrieval
      const token = req.get ? req.get("x-service-token") : req.headers["x-service-token"];
      console.log("Incoming x-service-token:", token);// undefined

      const userService = container.resolve<UserService>(TOKENS_USER.services.userService); // This line was already here
      verifyInternalRequest(req);

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
        { new: true }
      )

      return !!user
    }
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
