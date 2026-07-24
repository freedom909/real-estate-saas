import { readFileSync } from "fs";
import { parse, visit, Kind } from "graphql";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  healthScore: number; // 0-100
  agents: AgentResult[];
  summary: {
    totalChecks: number;
    totalPassed: number;
    totalFailed: number;
    totalWarnings: number;
  };
  recommendations: string[];
}

// ─── Schema Validation Agent ─────────────────────────────────────────────────

function readSchema(): string {
  return readFileSync("./src/subgraphs/audit/schema/schema.graphql", "utf-8");
}

function readResolver(): string {
  return readFileSync("./src/subgraphs/audit/resolvers/audit.resolver.ts", "utf-8");
}

function readService(): string {
  return readFileSync("./src/subgraphs/audit/services/audit.service.ts", "utf-8");
}

function readRepository(): string {
  return readFileSync("./src/subgraphs/audit/repos/audit.repository.ts", "utf-8");
}

function readModel(): string {
  return readFileSync("./src/subgraphs/audit/models/audit.model.ts", "utf-8");
}

function readRegistration(): string {
  return readFileSync("./src/modules/container/audit.register.ts", "utf-8");
}

interface SchemaField {
  name: string;
  args: { name: string; type: string; required: boolean }[];
  returnType: string;
  isList: boolean;
  isNullable: boolean;
}

interface SchemaType {
  name: string;
  fields: SchemaField[];
}

function parseSchema(sdl: string): {
  queries: SchemaField[];
  mutations: SchemaField[];
  types: SchemaType[];
} {
  const doc = parse(sdl);
  const queries: SchemaField[] = [];
  const mutations: SchemaField[] = [];
  const types: SchemaType[] = [];

  visit(doc, {
    ObjectTypeDefinition(node) {
      const typeName = node.name.value;
      const fields: SchemaField[] = [];

      node.fields?.forEach((f) => {
        const args =
          f.arguments?.map((a) => ({
            name: a.name.value,
            type: extractTypeName(a.type),
            required: a.type.kind === Kind.NON_NULL_TYPE,
          })) ?? [];

        const { typeName: returnTypeName, isList, isNullable } =
          extractReturnType(f.type);

        fields.push({
          name: f.name.value,
          args,
          returnType: returnTypeName,
          isList,
          isNullable,
        });
      });

      if (typeName === "Query") queries.push(...fields);
      else if (typeName === "Mutation") mutations.push(...fields);
      else types.push({ name: typeName, fields });
    },
  });

  return { queries, mutations, types };
}

function extractTypeName(typeNode: any): string {
  if (typeNode.kind === Kind.NON_NULL_TYPE) {
    return typeNode.type.name?.value ?? "unknown";
  }
  if (typeNode.kind === Kind.NAMED_TYPE) return typeNode.name.value;
  return "unknown";
}

function extractReturnType(typeNode: any): {
  typeName: string;
  isList: boolean;
  isNullable: boolean;
} {
  let isList = false;
  let isNullable = true;
  let current = typeNode;

  if (current.kind === Kind.NON_NULL_TYPE) {
    isNullable = false;
    current = current.type;
  }

  if (current.kind === Kind.LIST_TYPE) {
    isList = true;
    current = current.type;
    if (current.kind === Kind.NON_NULL_TYPE) {
      isNullable = false;
      current = current.type;
    }
  }

  if (current.kind === Kind.NAMED_TYPE) {
    return { typeName: current.name.value, isList, isNullable };
  }

  return { typeName: "unknown", isList, isNullable };
}

export function runSchemaValidator(): AgentResult {
  const start = Date.now();
  const details: any[] = [];

  try {
    const schemaSdl = readSchema();
    const resolverCode = readResolver();
    const serviceCode = readService();
    const repoCode = readRepository();
    const modelCode = readModel();
    const registrationCode = readRegistration();
    const parsedSchema = parseSchema(schemaSdl);

    let passed = 0;
    let failed = 0;
    let warnings = 0;

    // Check queries have resolvers
    for (const q of parsedSchema.queries) {
      const hasResolver =
        resolverCode.includes(`${q.name}:`) ||
        resolverCode.includes(`"${q.name}"`);
      if (hasResolver) {
        passed++;
        details.push({ check: `Query.${q.name} resolver exists`, status: "pass" });
      } else {
        failed++;
        details.push({
          check: `Query.${q.name} resolver exists`,
          status: "fail",
          message: "No resolver found",
        });
      }
    }

    // Check mutations have resolvers
    for (const m of parsedSchema.mutations) {
      const hasResolver =
        resolverCode.includes(`${m.name}:`) ||
        resolverCode.includes(`"${m.name}"`);
      if (hasResolver) {
        passed++;
        details.push({ check: `Mutation.${m.name} resolver exists`, status: "pass" });
      } else {
        failed++;
        details.push({
          check: `Mutation.${m.name} resolver exists`,
          status: "fail",
          message: "No resolver found",
        });
      }
    }

    // Check resolver calls service
    const serviceCalls = resolverCode.match(/service\.(\w+)\(/g) ?? [];
    for (const call of serviceCalls) {
      const method = call.replace("service.", "").replace("(", "");
      const hasMethod = serviceCode.includes(`${method}(`);
      if (hasMethod) {
        passed++;
        details.push({ check: `Service.${method} exists`, status: "pass" });
      } else {
        failed++;
        details.push({
          check: `Service.${method} exists`,
          status: "fail",
          message: "Method not found in service",
        });
      }
    }

    // Check service calls repository
    const repoCalls = serviceCode.match(/this\.repo\.(\w+)\(/g) ?? [];
    for (const call of repoCalls) {
      const method = call.replace("this.repo.", "").replace("(", "");
      const hasMethod = repoCode.includes(`${method}(`);
      if (hasMethod) {
        passed++;
        details.push({ check: `Repository.${method} exists`, status: "pass" });
      } else {
        failed++;
        details.push({
          check: `Repository.${method} exists`,
          status: "fail",
          message: "Method not found in repository",
        });
      }
    }

    // Check DI registration
    if (registrationCode.includes("AuditService")) {
      passed++;
      details.push({ check: "AuditService registered", status: "pass" });
    } else {
      failed++;
      details.push({ check: "AuditService registered", status: "fail" });
    }

    if (registrationCode.includes("AuditRepository")) {
      passed++;
      details.push({ check: "AuditRepository registered", status: "pass" });
    } else {
      failed++;
      details.push({ check: "AuditRepository registered", status: "fail" });
    }

    // Check model has schema fields
    const auditLogType = parsedSchema.types.find((t) => t.name === "AuditLog");
    if (auditLogType) {
      for (const field of auditLogType.fields) {
        // Skip __typename, federation fields, and 'id' (auto-generated by Mongoose as _id)
        if (field.name.startsWith("__") || field.name === "id") continue;
        const hasField =
          modelCode.includes(`${field.name}:`) ||
          modelCode.includes(`${field.name} {`);
        if (hasField) {
          passed++;
          details.push({
            check: `Model has field '${field.name}'`,
            status: "pass",
          });
        } else {
          warnings++;
          details.push({
            check: `Model has field '${field.name}'`,
            status: "warn",
            message: "Field not found in Mongoose model",
          });
        }
      }
    }

    return {
      agent: "Schema Validator",
      status: failed > 0 ? "fail" : warnings > 0 ? "warn" : "pass",
      total: passed + failed + warnings,
      passed,
      failed,
      warnings,
      duration: Date.now() - start,
      details,
    };
  } catch (err: any) {
    return {
      agent: "Schema Validator",
      status: "fail",
      total: 0,
      passed: 0,
      failed: 1,
      warnings: 0,
      duration: Date.now() - start,
      details: [{ check: "Schema parsing", status: "fail", message: err.message }],
    };
  }
}

// ─── Resolver Agent ──────────────────────────────────────────────────────────

export function runResolverValidator(): AgentResult {
  const start = Date.now();
  const details: any[] = [];
  let passed = 0;
  let failed = 0;

  try {
    const resolverCode = readResolver();

    // Check Query resolvers exist
    const queryMethods = ["getAuditLog", "getAuditLogsByResource"];
    for (const method of queryMethods) {
      if (resolverCode.includes(`${method}:`)) {
        passed++;
        details.push({
          check: `Query.${method} defined`,
          status: "pass",
        });
      } else {
        failed++;
        details.push({
          check: `Query.${method} defined`,
          status: "fail",
        });
      }
    }

    // Check Mutation resolvers
    if (resolverCode.includes("recordAuditLog:")) {
      passed++;
      details.push({ check: "Mutation.recordAuditLog defined", status: "pass" });
    } else {
      failed++;
      details.push({ check: "Mutation.recordAuditLog defined", status: "fail" });
    }

    // Check DI usage
    if (resolverCode.includes("container.resolve(AuditService)")) {
      passed++;
      details.push({ check: "Uses container.resolve for DI", status: "pass" });
    } else {
      failed++;
      details.push({ check: "Uses container.resolve for DI", status: "fail" });
    }

    // Check no direct model access
    const hasDirectModelAccess = resolverCode
      .split("\n")
      .some(
        (line) =>
          line.includes("AuditModel.") &&
          !line.includes("//") &&
          !line.includes("import")
      );
    if (!hasDirectModelAccess) {
      passed++;
      details.push({
        check: "No direct model access in resolver",
        status: "pass",
      });
    } else {
      failed++;
      details.push({
        check: "No direct model access in resolver",
        status: "fail",
        message: "Resolver accesses model directly",
      });
    }

    // Check input validation
    if (resolverCode.includes("UserInputError")) {
      passed++;
      details.push({ check: "Input validation with UserInputError", status: "pass" });
    } else {
      failed++;
      details.push({ check: "Input validation with UserInputError", status: "fail" });
    }

    // Check AuditLog field resolver
    if (resolverCode.includes("AuditLog:") && resolverCode.includes("user:")) {
      passed++;
      details.push({ check: "AuditLog.user field resolver exists", status: "pass" });
    } else {
      failed++;
      details.push({ check: "AuditLog.user field resolver exists", status: "fail" });
    }

    return {
      agent: "Resolver Validator",
      status: failed > 0 ? "fail" : "pass",
      total: passed + failed,
      passed,
      failed,
      warnings: 0,
      duration: Date.now() - start,
      details,
    };
  } catch (err: any) {
    return {
      agent: "Resolver Validator",
      status: "fail",
      total: 0,
      passed: 0,
      failed: 1,
      warnings: 0,
      duration: Date.now() - start,
      details: [{ check: "Resolver analysis", status: "fail", message: err.message }],
    };
  }
}

// ─── Service Agent ───────────────────────────────────────────────────────────

export function runServiceValidator(): AgentResult {
  const start = Date.now();
  const details: any[] = [];
  let passed = 0;
  let failed = 0;

  try {
    const serviceCode = readService();

    // Check @injectable
    if (serviceCode.includes("@injectable()")) {
      passed++;
      details.push({ check: "Service is @injectable", status: "pass" });
    } else {
      failed++;
      details.push({ check: "Service is @injectable", status: "fail" });
    }

    // Check repository injection
    if (serviceCode.includes("@inject(AuditRepository)")) {
      passed++;
      details.push({ check: "Repository injected via @inject", status: "pass" });
    } else {
      failed++;
      details.push({ check: "Repository injected via @inject", status: "fail" });
    }

    // Check methods exist
    const methods = ["getAuditLog", "getLogsByResource", "createLog"];
    for (const method of methods) {
      if (serviceCode.includes(`${method}(`)) {
        passed++;
        details.push({ check: `Service.${method} exists`, status: "pass" });
      } else {
        failed++;
        details.push({ check: `Service.${method} exists`, status: "fail" });
      }
    }

    // Check return types
    if (serviceCode.includes("Promise<")) {
      passed++;
      details.push({ check: "Methods return Promises", status: "pass" });
    } else {
      failed++;
      details.push({ check: "Methods return Promises", status: "fail" });
    }

    return {
      agent: "Service Validator",
      status: failed > 0 ? "fail" : "pass",
      total: passed + failed,
      passed,
      failed,
      warnings: 0,
      duration: Date.now() - start,
      details,
    };
  } catch (err: any) {
    return {
      agent: "Service Validator",
      status: "fail",
      total: 0,
      passed: 0,
      failed: 1,
      warnings: 0,
      duration: Date.now() - start,
      details: [{ check: "Service analysis", status: "fail", message: err.message }],
    };
  }
}

// ─── Report Generator ────────────────────────────────────────────────────────

export function generateReport(): AuditReport {
  const agents: AgentResult[] = [
    runSchemaValidator(),
    runResolverValidator(),
    runServiceValidator(),
  ];

  const summary = {
    totalChecks: agents.reduce((sum, a) => sum + a.total, 0),
    totalPassed: agents.reduce((sum, a) => sum + a.passed, 0),
    totalFailed: agents.reduce((sum, a) => sum + a.failed, 0),
    totalWarnings: agents.reduce((sum, a) => sum + a.warnings, 0),
  };

  const healthScore =
    summary.totalChecks > 0
      ? Math.round((summary.totalPassed / summary.totalChecks) * 100)
      : 0;

  const overallStatus =
    summary.totalFailed > 0
      ? "failing"
      : summary.totalWarnings > 0
        ? "degraded"
        : "healthy";

  const recommendations: string[] = [];
  if (summary.totalFailed > 0) {
    recommendations.push("Fix failing checks before deploying");
  }
  if (summary.totalWarnings > 0) {
    recommendations.push("Review warnings for potential issues");
  }
  if (healthScore < 80) {
    recommendations.push("Health score is below 80% — prioritize fixes");
  }
  if (recommendations.length === 0) {
    recommendations.push("All checks passing — system is healthy");
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

export function formatReportMarkdown(report: AuditReport): string {
  const lines: string[] = [];

  lines.push("# Audit Subgraph Report");
  lines.push("");
  lines.push(`**Generated:** ${report.timestamp}`);
  lines.push(`**Subgraph:** ${report.subgraph}`);
  lines.push(
    `**Status:** ${report.overallStatus === "healthy" ? "✅ Healthy" : report.overallStatus === "degraded" ? "⚠️ Degraded" : "❌ Failing"}`
  );
  lines.push(`**Health Score:** ${report.healthScore}/100`);
  lines.push("");

  lines.push("## Summary");
  lines.push("");
  lines.push(`| Metric | Count |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total Checks | ${report.summary.totalChecks} |`);
  lines.push(`| Passed | ${report.summary.totalPassed} |`);
  lines.push(`| Failed | ${report.summary.totalFailed} |`);
  lines.push(`| Warnings | ${report.summary.totalWarnings} |`);
  lines.push("");

  lines.push("## Agent Results");
  lines.push("");

  for (const agent of report.agents) {
    const icon =
      agent.status === "pass" ? "✅" : agent.status === "warn" ? "⚠️" : "❌";
    lines.push(`### ${icon} ${agent.agent}`);
    lines.push("");
    lines.push(
      `- **Status:** ${agent.status} | **Passed:** ${agent.passed} | **Failed:** ${agent.failed} | **Warnings:** ${agent.warnings}`
    );
    if (agent.duration) {
      lines.push(`- **Duration:** ${agent.duration}ms`);
    }

    if (agent.details && agent.details.length > 0) {
      lines.push("");
      lines.push("| Check | Status |");
      lines.push("|-------|--------|");
      for (const d of agent.details) {
        const dIcon =
          d.status === "pass" ? "✅" : d.status === "warn" ? "⚠️" : "❌";
        lines.push(`| ${d.check} | ${dIcon} |`);
      }
    }
    lines.push("");
  }

  lines.push("## Recommendations");
  lines.push("");
  for (const rec of report.recommendations) {
    lines.push(`- ${rec}`);
  }
  lines.push("");

  return lines.join("\n");
}

export function formatReportJSON(report: AuditReport): string {
  return JSON.stringify(report, null, 2);
}
