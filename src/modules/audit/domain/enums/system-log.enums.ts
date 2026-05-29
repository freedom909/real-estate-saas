////src/modules/audit/domain/enums/system-log.enums.ts
export const SYSTEM_LOG_LEVELS = ["DEBUG", "INFO", "WARN", "ERROR"] as const;
export type SystemLogLevel = typeof SYSTEM_LOG_LEVELS[number];

export const SYSTEM_LOG_TYPES = [
  "HTTP",
  "GRAPHQL",
  "DATABASE",
  "AUTH",
  "REDIS",
  "LLM",
  "TOOL",
  "SYSTEM",
] as const;
export type SystemLogType = typeof SYSTEM_LOG_TYPES[number];