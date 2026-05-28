

// auth-subgraph/auth/guards/subgraphAuthGuard.ts

import { GraphQLError } from "graphql"

export const subgraphAuthGuard =
  (sessionService: any, tokenBindingService: any) =>
  async (_: any, __: any, context: any, next: Function) => {
    const user = context.user

    if (!user) {
      throw new GraphQLError("UNAUTHORIZED")
    }

    // 1️⃣ Session 校验
    const session = await sessionService.validate(user.userId)

    if (!session) {
      throw new GraphQLError("SESSION_INVALID")
    }

    // 2️⃣ Token Binding 校验（可选）
    const isValidBinding = await tokenBindingService.validate(
      user.userId,
      context.req.ip,
      context.req.headers["user-agent"]
    )

    if (!isValidBinding) {
      throw new GraphQLError("TOKEN_BINDING_INVALID")
    }

    return next()
  } 