// src/core/admin/domain/entities/auditLog.ts

export interface AuditLogProps {
  id: string;
  adminId: string;
  action: string;
  target: string;
  targetId?: string;
  details?: string;
  ip?: string;
  createdAt: Date;
}

export class AuditLog {
  private props: AuditLogProps;

  constructor(props: AuditLogProps) {
    this.props = props;
  }

  get id() { return this.props.id; }
  get adminId() { return this.props.adminId; }
  get action() { return this.props.action; }
  get target() { return this.props.target; }
  get targetId() { return this.props.targetId; }
  get details() { return this.props.details; }
  get ip() { return this.props.ip; }
  get createdAt() { return this.props.createdAt; }
}
