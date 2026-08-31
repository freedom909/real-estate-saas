
export type SystemLogLevel =
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal";

export type SystemLogType =
  | "AUTH"
  | "SYSTEM"
  | "HTTP"
  | "GRAPHQL"
  | "DATABASE"
  | "REDIS"
  | "LLM"
  | "TOOL";

export interface SystemLog {
  id: string;

  level: SystemLogLevel;

  type: SystemLogType;

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