//
function normalizeAuthError(
  error: unknown
): string {

  if (!(error instanceof Error)) {
    return "UNKNOWN_AUTH_ERROR";
  }

  const msg =
    error.message.toLowerCase();

  if (
    msg.includes("jwt expired")
  ) {
    return "TOKEN_EXPIRED";
  }

  if (
    msg.includes("invalid token signature")
  ) {
    return "INVALID_SIGNATURE";
  }

  if (
    msg.includes("deleted_client")
  ) {
    return "OAUTH_CLIENT_DELETED";
  }

  if (
    msg.includes("pem")
  ) {
    return "INVALID_PROVIDER_KEY";
  }

  return "AUTH_FAILED";
}

export default normalizeAuthError;