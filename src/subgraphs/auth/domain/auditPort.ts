export interface AuditPort {
  record(event: AuditEvent): Promise<void>;
  query(params: AuditQuery): Promise<AuditEvent[]>;
}

export interface AuditEvent {
  userId: string;
  action: string;
  metadata?: any;
  timestamp?: Date;
}

export interface AuditQuery {
  userId?: string;
  action?: string;
  from?: Date;
  to?: Date;
}