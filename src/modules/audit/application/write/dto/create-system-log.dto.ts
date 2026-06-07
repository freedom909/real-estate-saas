import { SystemLogLevel, SystemLogType } from "../../../domain/enums/system-log.enums";

export interface CreateSystemLogDTO {
  level: SystemLogLevel;
  type: SystemLogType;
  service: string;
  module?: string;
  action?: string;
  message: string;
  data?: any;
  correlationId?: string;
  requestId?: string;
  metadat?: Record<
    string,
    any
  >;
  latencyMs?: number;
  stack?: string;
}