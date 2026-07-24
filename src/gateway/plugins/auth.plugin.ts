import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
import { Role, hasMinRole, mapLegacyRole } from "@/core/shared/domain/role";
import { getOperationAuth } from "@/gateway/auth/operationMap";
import mongoose from "mongoose";

/**
 * Gateway-level auth plugin.
 *
 * Intercepts every GraphQL operation at the gateway level and:
 * 1. Decodes JWT from Authorization header
 * 2. Looks up the session to get activeTenantId
 * 3. Looks up the operation in the auth map
 * 4. Rejects unauthenticated requests for protected operations
 * 5. Rejects unauthorized requests (insufficient role)
 * 6. Attaches decoded user + tenantId to gateway context
 */
export function createAuthPlugin() {
  return {
    async requestDidStart(requestContext: any) {
      const { request, contextValue } = requestContext;
      const authHeader = contextValue?.authorization;

      // Decode user from JWT
      const user = await decodeUserFromHeader(authHeader);
      (contextValue as any).user = user;

      // Lookup session to get activeTenantId
      if (user?.sessionId) {
        try {
          const SessionModel = mongoose.model("Session");
          const session = await SessionModel.findOne({ id: user.sessionId }).lean();
          if (session?.activeTenantId) {
            (contextValue as any).tenantId = session.activeTenantId;
            (contextValue as any).user.tenantId = session.activeTenantId;
          }
        } catch {
          // Session model may not be registered in gateway — skip gracefully
        }
      }

      // For introspection and SDL queries, skip auth
      const query = request.query?.trim();
      if (!query || query.startsWith("{ __schema") || query.startsWith("query { __schema")) {
        return {};
      }

      // Parse operation name
      const operationName = request.operationName;
      if (!operationName) return {};

      // Look up auth requirements
      const authReq = getOperationAuth(operationName);
      if (!authReq) return {}; // No auth requirement = public

      // Check authentication
      if (authReq.authenticated && !user) {
        throw new GraphQLError("Unauthenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // Check role
      if (authReq.minRole && user) {
        const userRole = user.role ?? Role.CUSTOMER;
        if (!hasMinRole(userRole, authReq.minRole)) {
          throw new GraphQLError(
            `Forbidden: requires ${authReq.minRole} role or higher`,
            { extensions: { code: "FORBIDDEN", requiredRole: authReq.minRole } }
          );
        }
      }

      return {};
    },
  };
}

async function decodeUserFromHeader(authHeader: string | undefined) {
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const token = authHeader.replace("Bearer ", "");
    const decodedHeader = jwt.decode(token, { complete: true });
    const alg = decodedHeader?.header?.alg;

    let secret: string;
    if (alg === "RS256") {
      secret = process.env.JWT_PUBLIC_KEY || process.env.ACCESS_TOKEN_SECRET!;
    } else {
      secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET!;
    }

    const payload = jwt.verify(token, secret, {
      algorithms: alg === "RS256" ? ["RS256"] : ["HS256"],
    }) as any;

    return {
      userId: payload.sub,
      sessionId: payload.sessionId,
      type: payload.type,
      email: payload.email,
      role: payload.role ? mapLegacyRole(payload.role) : Role.CUSTOMER,
    };
  } catch {
    return null;
  }
}
