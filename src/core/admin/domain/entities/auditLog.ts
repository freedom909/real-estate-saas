// src/core/admin/domain/entities/auditLog.ts

import { ResourceType } from "./resourceTypes";

/** Audit status — matches the Mongoose enum values. */
export type AuditStatus = "SUCCESS" | "FAILED" | "PENDING";

export interface AuditLogProps {
  id: string;
  userId: string;
  tenantId: string;
  ownerId: string;
  adminId: string;
  action: string;
  target: string;
  targetId?: string;
  resourceId?:string;
  requestId?:string;
  correlationId?:string;
  meta?:any;
  resourceType?:ResourceType;
  details?: string;
  ip?: string;
  createdAt: Date;
  status?: AuditStatus;
}

export class AuditLog {
  private props: AuditLogProps;

  constructor(props: AuditLogProps) {
    this.props = props;
  }

  get id() { return this.props.id; }
  get userId() { return this.props.userId; }
  get tenantId() { return this.props.tenantId; }
  get ownerId() { return this.props.ownerId; }
  get resourceId() { return this.props.resourceId; }
  get resourceType() { return this.props.resourceType; }
  get adminId() { return this.props.adminId; }
  get action() { return this.props.action; }
  get target() { return this.props.target; }
  get requestId() { return this.props.requestId; }
  get correlationId() { return this.props.correlationId; }
  get meta() { return this.props.meta; }
  get targetId() { return this.props.targetId; }
  get details() { return this.props.details; }
  get ip() { return this.props.ip; }
  get createdAt() { return this.props.createdAt; }
  get status() { return this.props.status; }
}
