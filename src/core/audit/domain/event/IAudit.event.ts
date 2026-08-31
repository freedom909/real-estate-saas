export interface AuditPort {
  record(event: IAuditEvent): Promise<void>;
  query(params: IAuditQuery): Promise<IAuditEvent[]>;
}

export interface IAuditEvent {
  id: string;
  userId: string;
  type: string;
  intent: string;
  domain: string;
  confidence: number;
  //action: string;
  metadata?: any;
  resourceId?: string;
  timestamp?: Date;
}

export interface IAuditQuery {
  userId?: string;
  action?: string;
  from?: Date;
  to?: Date;
}