import { Action } from "./action";
import { Resource } from "./resource";
import { AuthorizationIdentity } from "./authorizationIdentity";

export interface AuthorizationRequest {
  identity: AuthorizationIdentity;

  action: Action;

  resource: Resource;

  resourceOwnerId?: string | null;

  resourceTenantId?: string | null;
}
