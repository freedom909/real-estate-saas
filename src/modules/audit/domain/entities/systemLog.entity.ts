export interface SystemLog {
  id: string;

  level:
    | "debug"
    | "info"
    | "warn"
    | "error"
    | "fatal";

  type: string;

  service: string;

  module?: string;

  action?: string;

  message: string;

  correlationId?: string;

  requestId?: string;

  meta?: Record<string, any>;

  latencyMs?: number;

  stack?: string;

  createdAt: Date;
}