//src/subgraphs/user/resolvers/verifyInternalRequest.ts


function verifyInternalRequest(req: any): void {
  const expectedToken = process.env.INTERNAL_SERVICE_TOKEN;
  const providedToken =
    req.get?.("x-service-token") ??
    req.headers?.["x-service-token"];

  if (!expectedToken) {
    console.error(
      "[User InternalAuth] INTERNAL_SERVICE_TOKEN is not configured",
    );
    throw new Error("Service authentication unavailable");
  }

  if (
    typeof providedToken !== "string" ||
    providedToken.length === 0 ||
    providedToken !== expectedToken
  ) {
    console.warn("[User InternalAuth] Request authentication failed");
    throw new Error("Forbidden");
  }
}

export default verifyInternalRequest;
