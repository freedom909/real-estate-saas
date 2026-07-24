import "reflect-metadata";
import { describe, it, expect } from "@jest/globals";
import {
  generateReport,
  formatReportMarkdown,
  formatReportJSON,
  runSchemaValidator,
  runResolverValidator,
  runServiceValidator,
  AuditReport,
} from "./report";

// ═══════════════════════════════════════════════════════════════════════════════
// Reporting Agent — Report Generation Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe("Audit Reporting Agent", () => {
  // ── Individual Agent Validators ────────────────────────────────────────────

  describe("Schema Validator", () => {
    it("should run without errors", () => {
      const result = runSchemaValidator();

      expect(result.agent).toBe("Schema Validator");
      expect(result.total).toBeGreaterThan(0);
      expect(result.passed + result.failed + result.warnings).toBe(
        result.total
      );
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it("should have all queries covered", () => {
      const result = runSchemaValidator();
      const queryChecks = result.details?.filter((d: any) =>
        d.check.startsWith("Query.")
      );

      expect(queryChecks).toBeDefined();
      expect(queryChecks!.length).toBeGreaterThan(0);
      expect(queryChecks!.every((d: any) => d.status === "pass")).toBe(true);
    });

    it("should have all mutations covered", () => {
      const result = runSchemaValidator();
      const mutationChecks = result.details?.filter((d: any) =>
        d.check.startsWith("Mutation.")
      );

      expect(mutationChecks).toBeDefined();
      expect(mutationChecks!.length).toBeGreaterThan(0);
      expect(mutationChecks!.every((d: any) => d.status === "pass")).toBe(true);
    });
  });

  describe("Resolver Validator", () => {
    it("should run without errors", () => {
      const result = runResolverValidator();

      expect(result.agent).toBe("Resolver Validator");
      expect(result.total).toBeGreaterThan(0);
      expect(result.failed).toBe(0);
    });

    it("should verify DI pattern", () => {
      const result = runResolverValidator();
      const diCheck = result.details?.find((d: any) =>
        d.check.includes("container.resolve")
      );

      expect(diCheck).toBeDefined();
      expect(diCheck!.status).toBe("pass");
    });

    it("should verify no direct model access", () => {
      const result = runResolverValidator();
      const modelCheck = result.details?.find((d: any) =>
        d.check.includes("No direct model")
      );

      expect(modelCheck).toBeDefined();
      expect(modelCheck!.status).toBe("pass");
    });
  });

  describe("Service Validator", () => {
    it("should run without errors", () => {
      const result = runServiceValidator();

      expect(result.agent).toBe("Service Validator");
      expect(result.total).toBeGreaterThan(0);
      expect(result.failed).toBe(0);
    });

    it("should verify injectable decorator", () => {
      const result = runServiceValidator();
      const injectableCheck = result.details?.find((d: any) =>
        d.check.includes("@injectable")
      );

      expect(injectableCheck).toBeDefined();
      expect(injectableCheck!.status).toBe("pass");
    });

    it("should verify all required methods exist", () => {
      const result = runServiceValidator();
      const methodChecks = result.details?.filter((d: any) =>
        d.check.startsWith("Service.")
      );

      expect(methodChecks).toBeDefined();
      expect(methodChecks!.length).toBeGreaterThanOrEqual(3);
      expect(methodChecks!.every((d: any) => d.status === "pass")).toBe(true);
    });
  });

  // ── Full Report Generation ─────────────────────────────────────────────────

  describe("Full Report", () => {
    let report: AuditReport;

    it("should generate a complete report", () => {
      report = generateReport();

      expect(report).toBeDefined();
      expect(report.timestamp).toBeDefined();
      expect(report.subgraph).toBe("audit");
      expect(report.agents).toHaveLength(3);
      expect(report.summary).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it("should have valid health score (0-100)", () => {
      report = generateReport();

      expect(report.healthScore).toBeGreaterThanOrEqual(0);
      expect(report.healthScore).toBeLessThanOrEqual(100);
    });

    it("should have overall status", () => {
      report = generateReport();

      expect(["healthy", "degraded", "failing"]).toContain(
        report.overallStatus
      );
    });

    it("should have consistent summary totals", () => {
      report = generateReport();

      expect(report.summary.totalChecks).toBe(
        report.agents.reduce((sum, a) => sum + a.total, 0)
      );
      expect(report.summary.totalPassed).toBe(
        report.agents.reduce((sum, a) => sum + a.passed, 0)
      );
      expect(report.summary.totalFailed).toBe(
        report.agents.reduce((sum, a) => sum + a.failed, 0)
      );
    });

    it("should have at least one recommendation", () => {
      report = generateReport();

      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });

  // ── Report Formatting ──────────────────────────────────────────────────────

  describe("Report Formatting", () => {
    const report = generateReport();

    it("should format as Markdown", () => {
      const md = formatReportMarkdown(report);

      expect(typeof md).toBe("string");
      expect(md).toContain("# Audit Subgraph Report");
      expect(md).toContain("## Summary");
      expect(md).toContain("## Agent Results");
      expect(md).toContain("## Recommendations");
      expect(md).toContain("Health Score");
    });

    it("should format as JSON", () => {
      const json = formatReportJSON(report);

      expect(typeof json).toBe("string");
      const parsed = JSON.parse(json);
      expect(parsed.timestamp).toBeDefined();
      expect(parsed.agents).toHaveLength(3);
      expect(parsed.summary).toBeDefined();
    });

    it("Markdown should contain agent names", () => {
      const md = formatReportMarkdown(report);

      expect(md).toContain("Schema Validator");
      expect(md).toContain("Resolver Validator");
      expect(md).toContain("Service Validator");
    });

    it("Markdown should contain check results table", () => {
      const md = formatReportMarkdown(report);

      expect(md).toContain("| Check | Status |");
      expect(md).toContain("|-------|--------|");
    });
  });

  // ── Console Output ─────────────────────────────────────────────────────────

  describe("Console Report", () => {
    it("should log report to console", () => {
      const report = generateReport();
      const md = formatReportMarkdown(report);

      console.log(md);

      // Verify we can generate without errors
      expect(md.length).toBeGreaterThan(0);
    });
  });
});
