import { GraphQLError } from "graphql";

export function requireAuth(context: any) {
  if (!context.user) {
    throw new GraphQLError("Unauthenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return context.user;
}
