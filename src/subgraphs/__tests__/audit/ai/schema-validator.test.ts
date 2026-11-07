// src/subgraphs/__tests__/audit/ai/schema-validator.test.ts


import "reflect-metadata";
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  parse,
  Kind,
  type DocumentNode,
  type ObjectTypeDefinitionNode,
  type InputObjectTypeDefinitionNode,
} from "graphql";

const read = (path: string): string =>
  readFileSync(resolve(process.cwd(), path), "utf-8");

const schemaCode = read("src/subgraphs/audit/schema/schema.graphql");
const resolverCode = read("src/subgraphs/audit/resolvers/audit.resolver.ts");

const loggerCode = read(
  "src/core/audit/application/write/services/audit.logger.ts",
);

const queryCode = read(
  "src/core/audit/application/read/queries/get-audit-logs.query.ts",
);

const repositoryCode = read(
  "src/core/audit/infrastructure/repositories/auditLog.repository.ts",
);

const modelCode = read(
  "src/core/audit/domain/value-objects/audit-log.model.ts",
);

const registrationCode = read("src/modules/container/audit.register.ts");

const document: DocumentNode = parse(schemaCode);

function getObjectType(
  name: string,
): ObjectTypeDefinitionNode | undefined {
  return document.definitions.find(
    (definition): definition is ObjectTypeDefinitionNode =>
      definition.kind === Kind.OBJECT_TYPE_DEFINITION &&
      definition.name.value === name,
  );
}

function getInputType(
  name: string,
): InputObjectTypeDefinitionNode | undefined {
  return document.definitions.find(
    (definition): definition is InputObjectTypeDefinitionNode =>
      definition.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION &&
      definition.name.value === name,
  );
}



function getFields(typeName: string): string[] {
  const type = getObjectType(typeName);
  return type?.fields?.map((field) => field.name.value) ?? [];
}

function getInputFields(typeName: string): string[] {
  const type = getInputType(typeName);
  return type?.fields?.map((field) => field.name.value) ?? [];
}

function getOperation(typeName: "Query" | "Mutation", name: string) {
  return getObjectType(typeName)?.fields?.find(
    (field) => field.name.value === name,
  );
}

function isNonNullList(type: any): boolean {
  return (
    type.kind === Kind.NON_NULL_TYPE &&
    type.type.kind === Kind.LIST_TYPE
  );
}

function getNamedType(type: any): string {
  switch (type.kind) {
    case Kind.NON_NULL_TYPE:
    case Kind.LIST_TYPE:
      return getNamedType(type.type);

    case Kind.NAMED_TYPE:
      return type.name.value;

    default:
      throw new Error(`Unsupported GraphQL type: ${type.kind}`);
  }
}

function isNonNull(type: any): boolean {
  return type.kind === Kind.NON_NULL_TYPE;
}

describe("Audit Schema Validation", () => {
  describe("Schema structure", () => {
    it("should define getAuditLogs", () => {
      expect(getFields("Query")).toContain("getAuditLogs");
    });

    it("should define recordAuditLog", () => {
      expect(getFields("Mutation")).toContain("recordAuditLog");
    });

    it("should define AuditLog", () => {
      const fields = getFields("AuditLog");

      expect(fields).toContain("id");
      expect(fields).toContain("action");
      expect(fields).toContain("userId");
      expect(fields).toContain("tenantId");
      expect(fields).toContain("resourceId");
      expect(fields).toContain("resourceType");
      expect(fields).toContain("status");
      expect(fields).toContain("meta");
      expect(fields).toContain("createdAt");
    });

    it("should not require obsolete query names", () => {
      expect(getFields("Query")).not.toContain("getAuditLog");
      expect(getFields("Query")).not.toContain("getAuditLogsByResource");
    });
  });

  describe("GraphQL operation arguments", () => {
    it("getAuditLogs should accept AuditLogFilterInput", () => {
      const operation = getOperation("Query", "getAuditLogs");

      expect(operation).toBeDefined();
      expect(operation?.arguments).toHaveLength(1);

      const filter = operation?.arguments?.[0];

      expect(filter?.name.value).toBe("filter");
      expect(getNamedType(filter!.type)).toBe("AuditLogFilterInput");
    });

    it("recordAuditLog should accept required RecordAuditLogInput", () => {
      const operation = getOperation("Mutation", "recordAuditLog");

      expect(operation).toBeDefined();
      expect(operation?.arguments).toHaveLength(1);

      const input = operation?.arguments?.[0];

      expect(input?.name.value).toBe("input");
      expect(isNonNull(input!.type)).toBe(true);
      expect(getNamedType(input!.type)).toBe("RecordAuditLogInput");
    });

    it("RecordAuditLogInput should define required audit fields", () => {
      const fields = getInputFields("RecordAuditLogInput");

      expect(fields).toContain("action");
      expect(fields).toContain("resourceId");
      expect(fields).toContain("resourceType");
      expect(fields).toContain("status");
    });

    it("RecordAuditLogInput should allow optional user and tenant information", () => {
      const input = getInputType("RecordAuditLogInput");

      expect(input).toBeDefined();

      const userId = input?.fields?.find(
        (field) => field.name.value === "userId",
      );

      const tenantId = input?.fields?.find(
        (field) => field.name.value === "tenantId",
      );

      expect(userId).toBeDefined();
      expect(tenantId).toBeDefined();
      expect(isNonNull(userId!.type)).toBe(false);
      expect(isNonNull(tenantId!.type)).toBe(false);
    });
  });

  describe("Schema nullability", () => {
    it("AuditLog should have required core fields", () => {
      const type = getObjectType("AuditLog");
      expect(type).toBeDefined();

      const requiredFields = [
        "id",
        "action",
        "resourceId",
        "resourceType",
        "status",
        "createdAt",
      ];

      for (const name of requiredFields) {
        const field = type?.fields?.find(
          (item) => item.name.value === name,
        );

        expect(field).toBeDefined();
        expect(isNonNull(field!.type)).toBe(true);
      }
    });

    it("AuditLog userId and meta should be nullable", () => {
      const type = getObjectType("AuditLog");

      for (const name of ["userId", "meta"]) {
        const field = type?.fields?.find(
          (item) => item.name.value === name,
        );

        expect(field).toBeDefined();
        expect(isNonNull(field!.type)).toBe(false);
      }
    });

    it("recordAuditLog should return non-null AuditLog", () => {
      const operation = getOperation("Mutation", "recordAuditLog");

      expect(operation).toBeDefined();
      expect(isNonNull(operation!.type)).toBe(true);
      expect(getNamedType(operation!.type)).toBe("AuditLog");
    });

it("getAuditLogs should return a non-null list of AuditLog", () => {
  const operation = getOperation("Query", "getAuditLogs");

  expect(operation).toBeDefined();
  expect(isNonNull(operation!.type)).toBe(true);
  expect(isNonNullList(operation!.type)).toBe(true);
  expect(getNamedType(operation!.type)).toBe("AuditLog");
});
  });

  describe("Schema and resolver alignment", () => {
    it("should implement getAuditLogs", () => {
      expect(resolverCode).toMatch(/Query\s*:/);
      expect(resolverCode).toMatch(/getAuditLogs\s*:/);
    });

    it("should implement recordAuditLog", () => {
      expect(resolverCode).toMatch(/Mutation\s*:/);
      expect(resolverCode).toMatch(/recordAuditLog\s*:/);
    });

    it("should use container.resolve for dependency injection", () => {
      expect(resolverCode).toContain("container.resolve");
      expect(resolverCode).toContain(
        "TOKENS_AUDIT.services.getAuditLogsQuery",
      );
      expect(resolverCode).toContain(
        "TOKENS_AUDIT.services.auditLogger",
      );
    });

    it("should not access database models directly", () => {
      expect(resolverCode).not.toMatch(/\bAuditModel\s*\./);
      expect(resolverCode).not.toMatch(/\bAuditLogModel\s*\./);
    });

    it("should pass input to AuditLogger", () => {
      expect(resolverCode).toContain("service.writeAuditLog(input)");
    });

    it("should pass filter to GetAuditLogsQuery", () => {
      expect(resolverCode).toContain("service.execute(filter ?? {})");
    });
  });

  describe("Application service implementation", () => {
    it("AuditLogger should be injectable", () => {
      expect(loggerCode).toContain("@injectable()");
    });

    it("AuditLogger should inject the repository interface token", () => {
      expect(loggerCode).toContain(
        "TOKENS_AUDIT.repos.auditLogRepository",
      );
    });

it("AuditLogger should call repository.create", () => {
  expect(loggerCode).toMatch(
    /this\.repository\.create\s*\(\s*dto\s*\)/s
  );
});

    it("GetAuditLogsQuery should be injectable", () => {
      expect(queryCode).toContain("@injectable()");
    });

    it("GetAuditLogsQuery should inject the repository interface token", () => {
      expect(queryCode).toContain(
        "TOKENS_AUDIT.repos.auditLogRepository",
      );
    });

    it("GetAuditLogsQuery should call repository.findFiltered", () => {
      expect(queryCode).toContain("this.repository.findFiltered");
    });

    it("GetAuditLogsQuery should calculate pagination offset", () => {
      expect(queryCode).toContain("(page - 1) * limit");
    });
  });

  describe("Repository implementation", () => {
    it("should be injectable", () => {
      expect(repositoryCode).toContain("@injectable()");
    });

    it("should inject the audit log model token", () => {
      expect(repositoryCode).toContain(
        "TOKENS_AUDIT.models.auditLogModel",
      );
    });

    it("should use Mongoose exec for database queries", () => {
      expect(repositoryCode).toContain(".exec()");
    });

    it("should implement the expected repository methods", () => {
      const methods = [
        "create",
        "findAll",
        "findFiltered",
        "countFiltered",
        "findByUserId",
        "findByResource",
      ];

      for (const method of methods) {
        expect(repositoryCode).toMatch(
          new RegExp(`\\b${method}\\s*\\(`),
        );
      }
    });
  });

  describe("Model and schema alignment", () => {
    it("should define the core audit fields in the Mongoose model", () => {
      const fields = [
        "userId",
        "tenantId",
        "ownerId",
        "action",
        "resourceId",
        "resourceType",
        "status",
        "requestId",
        "correlationId",
        "meta",
      ];

      for (const field of fields) {
        expect(modelCode).toContain(field);
      }
    });
  });

  describe("Dependency injection registration", () => {
    it("should register the audit log model", () => {
      expect(registrationCode).toContain(
        "TOKENS_AUDIT.models.auditLogModel",
      );
    });

    it("should register the audit log repository", () => {
      expect(registrationCode).toContain(
        "TOKENS_AUDIT.repos.auditLogRepository",
      );
      expect(registrationCode).toContain("AuditLogRepository");
    });

    it("should register AuditLogger", () => {
      expect(registrationCode).toContain(
        "TOKENS_AUDIT.services.auditLogger",
      );
      expect(registrationCode).toContain("AuditLogger");
    });

    it("should register GetAuditLogsQuery", () => {
      expect(registrationCode).toContain(
        "TOKENS_AUDIT.services.getAuditLogsQuery",
      );
      expect(registrationCode).toContain("GetAuditLogsQuery");
    });
  });
});
