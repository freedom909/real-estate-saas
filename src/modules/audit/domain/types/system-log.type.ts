export interface SystemLog {
  id: string;
  level: string;
  type: string;
  service: string;
  module?: string;
  action?: string;
  message: string;
  correlationId?: string;
  requestId?: string;
  meta?: any;
  latencyMs?: number;
  stack?: string;
  createdAt: Date;
}