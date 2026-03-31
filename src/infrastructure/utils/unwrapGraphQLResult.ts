function unwrapGraphQLResult(body: any) {
  if (body.kind === "single") {
    return body.singleResult;
  }

  if (body.kind === "incremental") {
    return body.initialResult;
  }

  throw new Error("Unknown GraphQL response type");
}