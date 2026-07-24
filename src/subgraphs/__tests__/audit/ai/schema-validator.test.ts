import "reflect-metadata";
import { readFileSync } from "fs";
import { parse, visit, Kind } from "graphql";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function parseSchema(sdl: string): { queries: SchemaField[]; mutations: SchemaField[]; types: SchemaType[] } {
  const doc = parse(sdl);
  const queries: SchemaField[] = [];
  const mutations: SchemaField[] = [];
  const types: SchemaType[] = [];

  visit(doc, {
    ObjectTypeDefinition(node) {
      const typeName = node.name.value;
      const fields: SchemaField[] = [];

      node.fields?.forEach((f) => {
        const args = f.arguments?.map((a) => ({
          name: a.name.value,
          type: extractTypeName(a.type),
          required: a.type.kind === Kind.NON_NULL_TYPE,
        })) ?? [];

        const { typeName: returnTypeName, isList, isNullable } = extractReturnType(f.type);

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
  // Handle NonNull wrapping
  if (typeNode.kind === Kind.NON_NULL_TYPE) {
    return typeNode.type.name?.value ?? "unknown";
  }
  if (typeNode.kind === Kind.NAMED_TYPE) return typeNode.name.value;
  return "unknown";
}

function extractReturnType(typeNode: any): { typeName: string; isList: boolean; isNullable: boolean } {
  let isList = false;
  let isNullable = true;
  let current = typeNode;

  // Unwrap NON_NULL
  if (current.kind === Kind.NON_NULL_TYPE) {
    isNullable = false;
    current = current.type;
  }

  // Unwrap LIST
  if (current.kind === Kind.LIST_TYPE) {
    isList = true;
    current = current.type;
    // Unwrap inner NON_NULL if present
    if (current.kind === Kind.NON_NULL_TYPE) {
      isNullable = false;
      current = current.type;
    }
  }

  // NAMED_TYPE
  if (current.kind === Kind.NAMED_TYPE) {
    return { typeName: current.name.value, isList, isNullable };
  }

  return { typeName: "unknown", isList, isNullable };
}

// ─── Validation Checks ───────────────────────────────────────────────────────

interface ValidationResult {
  check: string;
  passed: boolean;
  message: string;
  severity: "error" | "warning";
}

function validateSchemaResolverAlignment(
  schema: { queries: SchemaField[]; mutations: SchemaField[] },
  resolverCode: string
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Check queries
  for (const q of schema.queries) {
    const hasResolver = resolverCode.includes(`${q.name}:`) || resolverCode.includes(`"${q.name}"`);
    results.push({
      check: `Query.${q.name} resolver exists`,
      passed: hasResolver,
      message: hasResolver
        ? `Query.${q.name} has a resolver`
        : `Query.${q.name} is defined in schema but has no resolver`,
      severity: "error",
    });

    // Check parameter names
    for (const arg of q.args) {
      const hasParam = resolverCode.includes(`${arg.name}`) || resolverCode.includes(`args.${arg.name}`);
      if (!hasParam) {
        results.push({
          check: `Query.${q.name} uses param '${arg.name}'`,
          passed: false,
          message: `Schema defines arg '${arg.name}' but resolver doesn't reference it`,
          severity: "warning",
        });
      }
    }
  }

  // Check mutations
  for (const m of schema.mutations) {
    const hasResolver = resolverCode.includes(`${m.name}:`) || resolverCode.includes(`"${m.name}"`);
    results.push({
      check: `Mutation.${m.name} resolver exists`,
      passed: hasResolver,
      message: hasResolver
        ? `Mutation.${m.name} has a resolver`
        : `Mutation.${m.name} is defined in schema but has no resolver`,
      severity: "error",
    });

    // Check parameter names
    for (const arg of m.args) {
      const hasParam = resolverCode.includes(`${arg.name}`) || resolverCode.includes(`args.${arg.name}`);
      if (!hasParam) {
        results.push({
          check: `Mutation.${m.name} uses param '${arg.name}'`,
          passed: false,
          message: `Schema defines arg '${arg.name}' but resolver doesn't reference it`,
          severity: "warning",
        });
      }
    }
  }

  return results;
}

function validateResolverServiceAlignment(
  resolverCode: string,
  serviceCode: string
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Extract service method calls from resolver
  const serviceCalls = resolverCode.match(/service\.(\w+)\(/g) ?? [];
  const serviceMethods = serviceCalls.map((c) => c.replace("service.", "").replace("(", ""));

  for (const method of serviceMethods) {
    const hasMethod = serviceCode.includes(`${method}(`);
    results.push({
      check: `Service.${method} exists`,
      passed: hasMethod,
      message: hasMethod
        ? `Resolver calls service.${method} and it exists`
        : `Resolver calls service.${method} but it's not defined in the service`,
      severity: "error",
    });
  }

  return results;
}

function validateServiceRepositoryAlignment(
  serviceCode: string,
  repoCode: string
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Extract repo method calls from service
  const repoCalls = serviceCode.match(/this\.repo\.(\w+)\(/g) ?? [];
  const repoMethods = repoCalls.map((c) => c.replace("this.repo.", "").replace("(", ""));

  for (const method of repoMethods) {
    const hasMethod = repoCode.includes(`${method}(`);
    results.push({
      check: `Repository.${method} exists`,
      passed: hasMethod,
      message: hasMethod
        ? `Service calls repo.${method} and it exists`
        : `Service calls repo.${method} but it's not defined in the repository`,
      severity: "error",
    });
  }

  return results;
}

function validateModelSchemaAlignment(
  schema: SchemaType[],
  modelCode: string
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Find the AuditLog type in schema
  const auditLogType = schema.find((t) => t.name === "AuditLog");
  if (!auditLogType) {
    results.push({
      check: "AuditLog type exists in schema",
      passed: false,
      message: "AuditLog type not found in schema",
      severity: "error",
    });
    return results;
  }

  results.push({
    check: "AuditLog type exists in schema",
    passed: true,
    message: "AuditLog type found in schema",
    severity: "error",
  });

  // Check each schema field exists in model
  for (const field of auditLogType.fields) {
    // Skip __typename, federation fields, and 'id' (auto-generated by Mongoose as _id)
    if (field.name.startsWith("__") || field.name === "id") continue;

    const hasField = modelCode.includes(`${field.name}:`) || modelCode.includes(`${field.name} {`);
    results.push({
      check: `Model has field '${field.name}'`,
      passed: hasField,
      message: hasField
        ? `Schema field '${field.name}' exists in Mongoose model`
        : `Schema field '${field.name}' is not in the Mongoose model`,
      severity: "warning",
    });
  }

  return results;
}

function validateDIRegistration(
  serviceCode: string,
  registrationCode: string
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Check if AuditService is registered
  const hasServiceRegistration = registrationCode.includes("AuditService");
  results.push({
    check: "AuditService registered in DI",
    passed: hasServiceRegistration,
    message: hasServiceRegistration
      ? "AuditService is registered in the DI container"
      : "AuditService is NOT registered in the DI container",
    severity: "error",
  });

  // Check if AuditRepository is registered
  const hasRepoRegistration = registrationCode.includes("AuditRepository");
  results.push({
    check: "AuditRepository registered in DI",
    passed: hasRepoRegistration,
    message: hasRepoRegistration
      ? "AuditRepository is registered in the DI container"
      : "AuditRepository is NOT registered in the DI container",
    severity: "error",
  });

  // Check if the model token is registered
  const hasModelRegistration = registrationCode.includes("TOKENS_AUDIT.models.audit");
  results.push({
    check: "AuditModel registered in DI",
    passed: hasModelRegistration,
    message: hasModelRegistration
      ? "AuditModel token is registered in the DI container"
      : "AuditModel token is NOT registered in the DI container",
    severity: "error",
  });

  return results;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Audit Schema Validation Agent", () => {
  let schemaSdl: string;
  let resolverCode: string;
  let serviceCode: string;
  let repoCode: string;
  let modelCode: string;
  let registrationCode: string;
  let parsedSchema: ReturnType<typeof parseSchema>;

  beforeAll(() => {
    schemaSdl = readSchema();
    resolverCode = readResolver();
    serviceCode = readService();
    repoCode = readRepository();
    modelCode = readModel();
    registrationCode = readRegistration();
    parsedSchema = parseSchema(schemaSdl);
  });

  describe("Schema parsing", () => {
    it("should parse queries from schema", () => {
      expect(parsedSchema.queries.length).toBeGreaterThan(0);
      expect(parsedSchema.queries.map((q) => q.name)).toContain("getAuditLog");
      expect(parsedSchema.queries.map((q) => q.name)).toContain("getAuditLogsByResource");
    });

    it("should parse mutations from schema", () => {
      expect(parsedSchema.mutations.length).toBeGreaterThan(0);
      expect(parsedSchema.mutations.map((m) => m.name)).toContain("recordAuditLog");
    });

    it("should parse AuditLog type from schema", () => {
      const auditLogType = parsedSchema.types.find((t) => t.name === "AuditLog");
      expect(auditLogType).toBeDefined();
      expect(auditLogType!.fields.map((f) => f.name)).toContain("id");
      expect(auditLogType!.fields.map((f) => f.name)).toContain("action");
      expect(auditLogType!.fields.map((f) => f.name)).toContain("userId");
      expect(auditLogType!.fields.map((f) => f.name)).toContain("resourceId");
      expect(auditLogType!.fields.map((f) => f.name)).toContain("metadata");
      expect(auditLogType!.fields.map((f) => f.name)).toContain("timestamp");
    });
  });

  describe("Schema-Resolver alignment", () => {
    it("should have resolvers for all schema operations", () => {
      const results = validateSchemaResolverAlignment(parsedSchema, resolverCode);
      const errors = results.filter((r) => !r.passed && r.severity === "error");
      const warnings = results.filter((r) => !r.passed && r.severity === "warning");

      warnings.forEach((w) => console.warn(`⚠️ ${w.message}`));

      expect(errors.length).toBe(0);
    });
  });

  describe("Resolver-Service alignment", () => {
    it("should call existing service methods", () => {
      const results = validateResolverServiceAlignment(resolverCode, serviceCode);
      const errors = results.filter((r) => !r.passed);

      expect(errors.length).toBe(0);
    });
  });

  describe("Service-Repository alignment", () => {
    it("should call existing repository methods", () => {
      const results = validateServiceRepositoryAlignment(serviceCode, repoCode);
      const errors = results.filter((r) => !r.passed);

      expect(errors.length).toBe(0);
    });
  });

  describe("Model-Schema alignment", () => {
    it("should have model fields for all schema fields", () => {
      const results = validateModelSchemaAlignment(parsedSchema.types, modelCode);
      const errors = results.filter((r) => !r.passed && r.severity === "error");
      const warnings = results.filter((r) => !r.passed && r.severity === "warning");

      warnings.forEach((w) => console.warn(`⚠️ ${w.message}`));

      expect(errors.length).toBe(0);
    });
  });

  describe("DI Registration completeness", () => {
    it("should have all dependencies registered", () => {
      const results = validateDIRegistration(serviceCode, registrationCode);
      const errors = results.filter((r) => !r.passed);

      expect(errors.length).toBe(0);
    });
  });

  describe("Schema field requirements", () => {
    it("should have required fields as non-nullable", () => {
      const auditLogType = parsedSchema.types.find((t) => t.name === "AuditLog");
      expect(auditLogType).toBeDefined();

      const idField = auditLogType!.fields.find((f) => f.name === "id");
      expect(idField?.isNullable).toBe(false);

      const actionField = auditLogType!.fields.find((f) => f.name === "action");
      expect(actionField?.isNullable).toBe(false);

      const userIdField = auditLogType!.fields.find((f) => f.name === "userId");
      expect(userIdField?.isNullable).toBe(false);

      const resourceIdField = auditLogType!.fields.find((f) => f.name === "resourceId");
      expect(resourceIdField?.isNullable).toBe(false);

      const timestampField = auditLogType!.fields.find((f) => f.name === "timestamp");
      expect(timestampField?.isNullable).toBe(false);
    });

    it("should have metadata as nullable", () => {
      const auditLogType = parsedSchema.types.find((t) => t.name === "AuditLog");
      const metadataField = auditLogType!.fields.find((f) => f.name === "metadata");
      expect(metadataField?.isNullable).toBe(true);
    });

    it("should have recordAuditLog return non-nullable AuditLog", () => {
      const recordMutation = parsedSchema.mutations.find((m) => m.name === "recordAuditLog");
      expect(recordMutation?.returnType).toBe("AuditLog");
      expect(recordMutation?.isNullable).toBe(false);
    });

    it("should have getAuditLog return nullable AuditLog", () => {
      const getQuery = parsedSchema.queries.find((q) => q.name === "getAuditLog");
      expect(getQuery?.returnType).toBe("AuditLog");
      expect(getQuery?.isNullable).toBe(true);
    });

    it("should have getAuditLogsByResource return non-nullable list", () => {
      const getQuery = parsedSchema.queries.find((q) => q.name === "getAuditLogsByResource");
      expect(getQuery?.returnType).toBe("AuditLog");
      expect(getQuery?.isList).toBe(true);
      expect(getQuery?.isNullable).toBe(false);
    });
  });

  describe("Mutation argument requirements", () => {
    it("recordAuditLog should have required action and userId", () => {
      const recordMutation = parsedSchema.mutations.find((m) => m.name === "recordAuditLog");
      expect(recordMutation).toBeDefined();

      const actionArg = recordMutation!.args.find((a) => a.name === "action");
      expect(actionArg?.required).toBe(true);
      expect(actionArg?.type).toBe("String");

      const userIdArg = recordMutation!.args.find((a) => a.name === "userId");
      expect(userIdArg?.required).toBe(true);
      expect(userIdArg?.type).toBe("ID");
    });

    it("recordAuditLog should have optional resourceId and metadata", () => {
      const recordMutation = parsedSchema.mutations.find((m) => m.name === "recordAuditLog");

      const resourceIdArg = recordMutation!.args.find((a) => a.name === "resourceId");
      expect(resourceIdArg?.required).toBe(false);

      const metadataArg = recordMutation!.args.find((a) => a.name === "metadata");
      expect(metadataArg?.required).toBe(false);
    });
  });

  describe("Query argument requirements", () => {
    it("getAuditLog should have required userId", () => {
      const getQuery = parsedSchema.queries.find((q) => q.name === "getAuditLog");
      expect(getQuery).toBeDefined();

      const userIdArg = getQuery!.args.find((a) => a.name === "userId");
      expect(userIdArg?.required).toBe(true);
      expect(userIdArg?.type).toBe("ID");
    });

    it("getAuditLogsByResource should have required resourceId", () => {
      const getQuery = parsedSchema.queries.find((q) => q.name === "getAuditLogsByResource");
      expect(getQuery).toBeDefined();

      const resourceIdArg = getQuery!.args.find((a) => a.name === "resourceId");
      expect(resourceIdArg?.required).toBe(true);
      expect(resourceIdArg?.type).toBe("ID");
    });
  });

  describe("Resolver implementation patterns", () => {
    it("resolvers should use container.resolve for dependency injection", () => {
      expect(resolverCode).toContain("container.resolve(AuditService)");
    });

    it("resolvers should not access models directly (except through service)", () => {
      // The resolver should NOT import or use AuditModel directly
      // It should only use the service layer
      const lines = resolverCode.split("\n");
      const hasDirectModelAccess = lines.some(
        (line) =>
          line.includes("AuditModel.") &&
          !line.includes("//") &&
          !line.includes("import")
      );
      expect(hasDirectModelAccess).toBe(false);
    });

    it("resolvers should validate input before calling service", () => {
      expect(resolverCode).toContain("UserInputError");
      expect(resolverCode).toContain("mongoose.Types.ObjectId.isValid");
    });
  });

  describe("Service implementation patterns", () => {
    it("service should be injectable", () => {
      expect(serviceCode).toContain("@injectable()");
    });

    it("service should inject repository", () => {
      expect(serviceCode).toContain("@inject(AuditRepository)");
    });

    it("service methods should return promises", () => {
      expect(serviceCode).toContain("Promise<AuditLogDocument>");
    });
  });

  describe("Repository implementation patterns", () => {
    it("repository should be injectable", () => {
      expect(repoCode).toContain("@injectable()");
    });

    it("repository should inject model via token", () => {
      expect(repoCode).toContain("@inject(TOKENS_AUDIT.models.audit)");
    });

    it("repository should use exec() for queries", () => {
      expect(repoCode).toContain(".exec()");
    });
  });

  describe("Summary report", () => {
    it("should generate validation summary", () => {
      const allResults = [
        ...validateSchemaResolverAlignment(parsedSchema, resolverCode),
        ...validateResolverServiceAlignment(resolverCode, serviceCode),
        ...validateServiceRepositoryAlignment(serviceCode, repoCode),
        ...validateModelSchemaAlignment(parsedSchema.types, modelCode),
        ...validateDIRegistration(serviceCode, registrationCode),
      ];

      const errors = allResults.filter((r) => !r.passed && r.severity === "error");
      const warnings = allResults.filter((r) => !r.passed && r.severity === "warning");

      console.log("\n📊 Audit Schema Validation Report");
      console.log("─".repeat(50));
      console.log(`✅ Passed: ${allResults.filter((r) => r.passed).length}`);
      console.log(`❌ Errors: ${errors.length}`);
      console.log(`⚠️  Warnings: ${warnings.length}`);
      console.log("─".repeat(50));

      if (errors.length > 0) {
        console.log("\nErrors:");
        errors.forEach((e) => console.log(`  ❌ ${e.message}`));
      }

      if (warnings.length > 0) {
        console.log("\nWarnings:");
        warnings.forEach((w) => console.log(`  ⚠️  ${w.message}`));
      }

      console.log("─".repeat(50));

      // The test passes if there are no errors
      expect(errors.length).toBe(0);
    });
  });
});
