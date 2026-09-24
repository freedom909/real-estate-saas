export enum AuthorizationDecisionCode {
  ALLOWED = "ALLOWED",

  UNAUTHENTICATED = "UNAUTHENTICATED",

  GLOBAL_ROLE_DENIED = "GLOBAL_ROLE_DENIED",

  MEMBERSHIP_ROLE_DENIED = "MEMBERSHIP_ROLE_DENIED",

  TENANT_SCOPE_DENIED = "TENANT_SCOPE_DENIED",

  OWNERSHIP_DENIED = "OWNERSHIP_DENIED",

  RESOURCE_DENIED = "RESOURCE_DENIED",
}

export interface AuthorizationDecision {
  allowed: boolean;

  reason?: string;

  code?: AuthorizationDecisionCode;
}
