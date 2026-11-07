
import { readFileSync } from "fs";
import { resolve } from "path";
import { parse, Kind, type DocumentNode } from "graphql";

// ============================================================
// Types
// ============================================================

export interface AgentResult {
  agent: string;
  status: "pass" | "fail" | "warn";
  total: number;
  passed: number;
  failed: number;
  warnings: number;
  duration?: number;
  details?: any[];
}

export interface AuditReport {
  timestamp: string;
  subgraph: string;
  overallStatus: "healthy" | "degraded" | "failing";
  healthScore: number;
  agents: AgentResult[];
  summary: {
    totalChecks: number;
    totalPassed: number;
    totalFailed: number;
    totalWarnings: number;
  };
  recommendations: string[];
}

// ============================================================
// Source paths
// ============================================================

const PATHS = {
  schema: "src/subgraphs/audit/schema/schema.graphql",
  resolver: "src/subgraphs/audit/resolvers/audit.resolver.ts",

  logger:
    "src/core/audit/application/write/services/audit.logger.ts",

  query:
    "src/core/audit/application/read/queries/get-audit-logs.query.ts",

  repository:
    "src/core/audit/infrastructure/repositories/auditLog.repository.ts",

  model:
    "src/core/audit/domain/value-objects/audit-log.model.ts",

  registration: "src/modules/container/audit.register.ts",
};

function readSource(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf-8");
}

function readSchema(): string {
  return readSource(PATHS.schema);
}

function readResolver(): string {
  return readSource(PATHS.resolver);
}

function readLogger(): string {
  return readSource(PATHS.logger);
}

function readQuery(): string {
  return readSource(PATHS.query);
}

function readRepository(): string {
  return readSource(PATHS.repository);
}

function readModel(): string {
  return readSource(PATHS.model);
}

function readRegistration(): string {
  return readSource(PATHS.registration);
}

// ============================================================
// Shared validation helpers
// ============================================================

interface CheckResult {
  check: string;
  status: "pass" | "fail" | "warn";
  message?: string;
}

function addCheck(
  details: CheckResult[],
  check: string,
  passed: boolean,
  message?: string,
): void {
  details.push({
    check,
    status: passed ? "pass" : "fail",
    ...(message ? { message } : {}),
  });
}

function addWarning(
  details: CheckResult[],
  check: string,
  message: string,
): void {
  details.push({
    check,
    status: "warn",
    message,
  });
}

function buildAgentResult(
  agent: string,
  details: CheckResult[],
  start: number,
): AgentResult {
  const passed = details.filter((d) => d.status === "pass").length;
  const failed = details.filter((d) => d.status === "fail").length;
  const warnings = details.filter((d) => d.status === "warn").length;

  return {
    agent,
    status: failed > 0 ? "fail" : warnings > 0 ? "warn" : "pass",
    total: details.length,
    passed,
    failed,
    warnings,
    duration: Date.now() - start,
    details,
  };
}

function failedAgent(
  agent: string,
  start: number,
  error: unknown,
): AgentResult {
  const message =
    error instanceof Error ? error.message : String(error);

  return buildAgentResult(
    agent,
    [
      {
        check: `${agent} analysis`,
        status: "fail",
        message,
      },
    ],
    start,
  );
}

// ============================================================
// GraphQL schema helpers
// ============================================================

interface SchemaField {
  name: string;
  args: {
    name: string;
    type: string;
    required: boolean;
  }[];
  returnType: string;
  isList: boolean;
  isNullable: boolean;
}

interface SchemaType {
  name: string;
  fields: SchemaField[];
}

function extractTypeName(typeNode: any): string {
  switch (typeNode.kind) {
    case Kind.NON_NULL_TYPE:
    case Kind.LIST_TYPE:
      return extractTypeName(typeNode.type);

    case Kind.NAMED_TYPE:
      return typeNode.name.value;

    default:
      return "unknown";
  }
}

function extractReturnType(typeNode: any): {
  typeName: string;
  isList: boolean;
  isNullable: boolean;
} {
  let current = typeNode;
  let isList = false;
  let isNullable = true;

  if (current.kind === Kind.NON_NULL_TYPE) {
    isNullable = false;
    current = current.type;
  }

  if (current.kind === Kind.LIST_TYPE) {
    isList = true;
    current = current.type;
  }

  if (current.kind === Kind.NON_NULL_TYPE) {
    current = current.type;
  }

  return {
    typeName: extractTypeName(current),
    isList,
    isNullable,
  };
}

function parseSchema(sdl: string): {
  queries: SchemaField[];
  mutations: SchemaField[];
  types: SchemaType[];
} {
  const document: DocumentNode = parse(sdl);

  const queries: SchemaField[] = [];
  const mutations: SchemaField[] = [];
  const types: SchemaType[] = [];

  for (const definition of document.definitions) {
    if (definition.kind !== Kind.OBJECT_TYPE_DEFINITION) {
      continue;
    }

    const typeName = definition.name.value;

    const fields: SchemaField[] = (definition.fields ?? []).map(
      (field) => {
        const args = (field.arguments ?? []).map((argument) => ({
          name: argument.name.value,
          type: extractTypeName(argument.type),
          required: argument.type.kind === Kind.NON_NULL_TYPE,
        }));

        const returnInfo = extractReturnType(field.type);

        return {
          name: field.name.value,
          args,
          returnType: returnInfo.typeName,
          isList: returnInfo.isList,
          isNullable: returnInfo.isNullable,
        };
      },
    );

    if (typeName === "Query") {
      queries.push(...fields);
    } else if (typeName === "Mutation") {
      mutations.push(...fields);
    } else {
      types.push({
        name: typeName,
        fields,
      });
    }
  }

  return {
    queries,
    mutations,
    types,
  };
}

// ============================================================
// Schema Validator
// ============================================================

export function runSchemaValidator(): AgentResult {
  const start = Date.now();
  const details: CheckResult[] = [];

  try {
    const schema = parseSchema(readSchema());
    const resolverCode = readResolver();
    const loggerCode = readLogger();
    const queryCode = readQuery();
    const repositoryCode = readRepository();
    const modelCode = readModel();
    const registrationCode = readRegistration();

    // 1. Query resolver alignment
    for (const query of schema.queries) {
      const exists = new RegExp(
        `\\b${query.name}\\s*:`,
      ).test(resolverCode);

      addCheck(
        details,
        `Query.${query.name} resolver exists`,
        exists,
        exists ? undefined : "Query resolver not found",
      );
    }

    // 2. Mutation resolver alignment
    for (const mutation of schema.mutations) {
      const exists = new RegExp(
        `\\b${mutation.name}\\s*:`,
      ).test(resolverCode);

      addCheck(
        details,
        `Mutation.${mutation.name} resolver exists`,
        exists,
        exists ? undefined : "Mutation resolver not found",
      );
    }

    // 3. Resolver -> Application Service alignment
    const loggerMethodExists =
      /writeAuditLog\s*\(/.test(loggerCode);

    const queryMethodExists =
      /execute\s*\(/.test(queryCode);

    addCheck(
      details,
      "Service.writeAuditLog exists",
      loggerMethodExists,
    );

    addCheck(
      details,
      "Service.execute exists",
      queryMethodExists,
    );

    // 4. Application Service -> Repository alignment
    const loggerCallsCreate =
      /this\.repository\.create\s*\(/s.test(loggerCode);

    const queryCallsFindFiltered =
      /this\.repository\.findFiltered\s*\(/s.test(queryCode);

    addCheck(
      details,
      "Repository.create exists",
      loggerCallsCreate &&
        /create\s*\(/.test(repositoryCode),
    );

    addCheck(
      details,
      "Repository.findFiltered exists",
      queryCallsFindFiltered &&
        /findFiltered\s*\(/.test(repositoryCode),
    );

    // 5. Model fields
    const auditLogType = schema.types.find(
      (type) => type.name === "AuditLog",
    );

    addCheck(
      details,
      "AuditLog type exists",
      Boolean(auditLogType),
    );

    if (auditLogType) {
      for (const field of auditLogType.fields) {
        if (
          field.name === "id" ||
          field.name.startsWith("__")
        ) {
          continue;
        }

        const exists = new RegExp(
          `\\b${field.name}\\s*:`,
        ).test(modelCode);

        if (exists) {
          addCheck(
            details,
            `Model has field '${field.name}'`,
            true,
          );
        } else {
          addWarning(
            details,
            `Model has field '${field.name}'`,
            "Field was not found by the source-code inspection",
          );
        }
      }
    }

    // 6. Dependency injection registration
    addCheck(
      details,
      "AuditLogger registered in DI",
      registrationCode.includes(
        "TOKENS_AUDIT.services.auditLogger",
      ) && registrationCode.includes("AuditLogger"),
    );

    addCheck(
      details,
      "GetAuditLogsQuery registered in DI",
      registrationCode.includes(
        "TOKENS_AUDIT.services.getAuditLogsQuery",
      ) && registrationCode.includes("GetAuditLogsQuery"),
    );

    addCheck(
      details,
      "AuditLogRepository registered in DI",
      registrationCode.includes(
        "TOKENS_AUDIT.repos.auditLogRepository",
      ) && registrationCode.includes("AuditLogRepository"),
    );

    addCheck(
      details,
      "AuditLogModel registered in DI",
      registrationCode.includes(
        "TOKENS_AUDIT.models.auditLogModel",
      ),
    );

    return buildAgentResult(
      "Schema Validator",
      details,
      start,
    );
  } catch (error) {
    return failedAgent("Schema Validator", start, error);
  }
}

// ============================================================
// Resolver Validator
// ============================================================

export function runResolverValidator(): AgentResult {
  const start = Date.now();
  const details: CheckResult[] = [];

  try {
    const resolverCode = readResolver();

    // 1. Query resolver
    addCheck(
      details,
      "Query.getAuditLogs defined",
      /Query\s*:\s*\{[\s\S]*?getAuditLogs\s*:/.test(
        resolverCode,
      ),
    );

    // 2. Mutation resolver
    addCheck(
      details,
      "Mutation.recordAuditLog defined",
      /Mutation\s*:\s*\{[\s\S]*?recordAuditLog\s*:/.test(
        resolverCode,
      ),
    );

    // 3. Dependency injection
    const usesContainerResolve =
      resolverCode.includes("container.resolve");

    const usesLoggerToken =
      resolverCode.includes(
        "TOKENS_AUDIT.services.auditLogger",
      );

    const usesQueryToken =
      resolverCode.includes(
        "TOKENS_AUDIT.services.getAuditLogsQuery",
      );

    addCheck(
      details,
      "Uses container.resolve for DI",
      usesContainerResolve && usesLoggerToken && usesQueryToken,
    );

    // 4. No direct database model access
    const hasDirectModelAccess =
      /\b(?:AuditModel|AuditLogModel)\s*\./.test(
        resolverCode,
      );

    addCheck(
      details,
      "No direct model access in resolver",
      !hasDirectModelAccess,
      hasDirectModelAccess
        ? "Resolver accesses a database model directly"
        : undefined,
    );

    // 5. Service delegation
    addCheck(
      details,
      "Resolver delegates writes to AuditLogger",
      /service\.writeAuditLog\s*\(\s*input\s*\)/s.test(
        resolverCode,
      ),
    );

    addCheck(
      details,
      "Resolver delegates reads to GetAuditLogsQuery",
      /service\.execute\s*\(\s*filter\s*\?\?\s*\{\}\s*\)/s.test(
        resolverCode,
      ),
    );

    return buildAgentResult(
      "Resolver Validator",
      details,
      start,
    );
  } catch (error) {
    return failedAgent("Resolver Validator", start, error);
  }
}

// ============================================================
// Service Validator
// ============================================================

export function runServiceValidator(): AgentResult {
  const start = Date.now();
  const details: CheckResult[] = [];

  try {
    const loggerCode = readLogger();
    const queryCode = readQuery();
    const repositoryCode = readRepository();

    // 1. Injectable decorators
    const loggerInjectable =
      loggerCode.includes("@injectable()");

    const queryInjectable =
      queryCode.includes("@injectable()");

    addCheck(
      details,
      "Service uses @injectable()",
      loggerInjectable && queryInjectable,
    );

    // 2. Repository injection
    const loggerInjectsRepository =
      loggerCode.includes(
        "TOKENS_AUDIT.repos.auditLogRepository",
      );

    const queryInjectsRepository =
      queryCode.includes(
        "TOKENS_AUDIT.repos.auditLogRepository",
      );

    addCheck(
      details,
      "Service injects IAuditLogRepository",
      loggerInjectsRepository && queryInjectsRepository,
    );

    // 3. Application service methods
    addCheck(
      details,
      "Service.AuditLogger.writeAuditLog exists",
      /writeAuditLog\s*\(/.test(loggerCode),
    );

    addCheck(
      details,
      "Service.GetAuditLogsQuery.execute exists",
      /execute\s*\(/.test(queryCode),
    );

    // 4. Repository methods used by services
    addCheck(
      details,
      "Service.Repository.create exists",
      /this\.repository\.create\s*\(/s.test(loggerCode) &&
        /create\s*\(/.test(repositoryCode),
    );

    addCheck(
      details,
      "Service.Repository.findFiltered exists",
      /this\.repository\.findFiltered\s*\(/s.test(queryCode) &&
        /findFiltered\s*\(/.test(repositoryCode),
    );

    // 5. Promise return types
    addCheck(
      details,
      "AuditLogger returns Promise",
      /Promise\s*<\s*AuditLog\s*>/.test(loggerCode),
    );

    addCheck(
      details,
      "GetAuditLogsQuery returns Promise",
      /Promise\s*<\s*AuditLog\s*\[\s*\]\s*>/.test(queryCode),
    );

    return buildAgentResult(
      "Service Validator",
      details,
      start,
    );
  } catch (error) {
    return failedAgent("Service Validator", start, error);
  }
}

// ============================================================
// Report Generator
// ============================================================

export function generateReport(): AuditReport {
  const agents: AgentResult[] = [
    runSchemaValidator(),
    runResolverValidator(),
    runServiceValidator(),
  ];

  const summary = {
    totalChecks: agents.reduce(
      (sum, agent) => sum + agent.total,
      0,
    ),
    totalPassed: agents.reduce(
      (sum, agent) => sum + agent.passed,
      0,
    ),
    totalFailed: agents.reduce(
      (sum, agent) => sum + agent.failed,
      0,
    ),
    totalWarnings: agents.reduce(
      (sum, agent) => sum + agent.warnings,
      0,
    ),
  };

  const healthScore =
    summary.totalChecks > 0
      ? Math.round(
          (summary.totalPassed / summary.totalChecks) * 100,
        )
      : 0;

  const overallStatus =
    summary.totalFailed > 0
      ? "failing"
      : summary.totalWarnings > 0
        ? "degraded"
        : "healthy";

  const recommendations: string[] = [];

  if (summary.totalFailed > 0) {
    recommendations.push(
      "Fix failing checks before deploying",
    );
  }

  if (summary.totalWarnings > 0) {
    recommendations.push(
      "Review warnings for potential issues",
    );
  }

  if (healthScore < 80) {
    recommendations.push(
      "Health score is below 80% - prioritize fixes",
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "All checks passing - system is healthy",
    );
  }

  return {
    timestamp: new Date().toISOString(),
    subgraph: "audit",
    overallStatus,
    healthScore,
    agents,
    summary,
    recommendations,
  };
}

// ============================================================
// Markdown Formatter
// ============================================================

export function formatReportMarkdown(
  report: AuditReport,
): string {
  const lines: string[] = [];

  lines.push("# Audit Subgraph Report");
  lines.push("");

  lines.push(`**Generated:** ${report.timestamp}`);
  lines.push(`**Subgraph:** ${report.subgraph}`);

  const statusLabel =
    report.overallStatus === "healthy"
      ? "Healthy"
      : report.overallStatus === "degraded"
        ? "Degraded"
        : "Failing";

  lines.push(`**Status:** ${statusLabel}`);
  lines.push(`**Health Score:** ${report.healthScore}/100`);
  lines.push("");

  lines.push("## Summary");
  lines.push("");

  lines.push("| Metric | Count |");
  lines.push("|--------|-------|");
  lines.push(
    `| Total Checks | ${report.summary.totalChecks} |`,
  );
  lines.push(
    `| Passed | ${report.summary.totalPassed} |`,
  );
  lines.push(
    `| Failed | ${report.summary.totalFailed} |`,
  );
  lines.push(
    `| Warnings | ${report.summary.totalWarnings} |`,
  );
  lines.push("");

  lines.push("## Agent Results");
  lines.push("");

  for (const agent of report.agents) {
    lines.push(`### ${agent.agent}`);
    lines.push("");

    lines.push(
      `- **Status:** ${agent.status} | ` +
        `**Passed:** ${agent.passed} | ` +
        `**Failed:** ${agent.failed} | ` +
        `**Warnings:** ${agent.warnings}`,
    );

    if (agent.duration !== undefined) {
      lines.push(`- **Duration:** ${agent.duration}ms`);
    }

    if (agent.details && agent.details.length > 0) {
      lines.push("");
      lines.push("| Check | Status |");
      lines.push("|-------|--------|");

      for (const detail of agent.details) {
        lines.push(
          `| ${detail.check} | ${detail.status} |`,
        );
      }
    }

    lines.push("");
  }

  lines.push("## Recommendations");
  lines.push("");

  for (const recommendation of report.recommendations) {
    lines.push(`- ${recommendation}`);
  }

  lines.push("");

  return lines.join("\n");
}

// ============================================================
// JSON Formatter
// ============================================================

export function formatReportJSON(
  report: AuditReport,
): string {
  return JSON.stringify(report, null, 2);
}
