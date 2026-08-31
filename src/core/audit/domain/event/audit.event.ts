// src/modules/audit/domain/event/audit.event.ts

import { DomainEvent } from "@/shared/eventbus/domain.event";
import { AuditStatus, ResourceType } from "../value-objects/audit.types";


export class AuditEvent extends DomainEvent {
  readonly eventName = "audit.created";

  constructor(
    public readonly userId: string,
    public readonly action: string,
    public readonly resourceId: string,
    public readonly resourceType: ResourceType,
    public readonly status: AuditStatus,

    public readonly target?: string,
    public readonly tenantId?: string,
    public readonly ownerId?: string,
    public readonly adminId?: string,
  ) {
    super();
  }
}