import { SystemLogLevel, SystemLogType } from "../../../domain/enums/system-log.enums";

export interface CreateSystemLogDTO {
  level: SystemLogLevel;
  type: SystemLogType;
  service: string;
  module?: string;
  action?: string;
  message: string;
  correlationId?: string;
  requestId?: string;
  metadata?: Record<
    string,
    any
  >;
  latencyMs?: number;
  stack?: string;
}