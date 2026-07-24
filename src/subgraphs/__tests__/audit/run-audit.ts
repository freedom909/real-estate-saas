#!/usr/bin/env node

/**
 * Audit Agent CLI — Run the full audit suite and generate a report.
 *
 * Usage:
 *   npx tsx src/subgraphs/__tests__/audit/run-audit.ts
 *   npx tsx src/subgraphs/__tests__/audit/run-audit.ts --format json
 *   npx tsx src/subgraphs/__tests__/audit/run-audit.ts --format markdown
 *   npx tsx src/subgraphs/__tests__audit/run-audit.ts --output report.md
 *   npx tsx src/subgraphs/__tests__/audit/run-audit.ts --output report.json
 */

import { generateReport, formatReportMarkdown, formatReportJSON } from "./ai/report";
import { writeFileSync } from "fs";
import { resolve } from "path";

// ─── CLI Args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function getArg(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
}

function hasFlag(flag: string): boolean {
  return args.includes(flag);
}

const format = getArg("--format") ?? "markdown";
const outputFile = getArg("--output");
const verbose = hasFlag("--verbose") || hasFlag("-v");
const quiet = hasFlag("--quiet") || hasFlag("-q");
const exitOnFail = hasFlag("--fail-fast");

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  if (!quiet) {
    console.log("\n🔍 Running Audit Agent...\n");
  }

  const start = Date.now();
  const report = generateReport();
  const duration = Date.now() - start;

  // ── Output ──────────────────────────────────────────────────────────────

  if (outputFile) {
    const content =
      format === "json"
        ? formatReportJSON(report)
        : formatReportMarkdown(report);

    const outputPath = resolve(outputFile);
    writeFileSync(outputPath, content, "utf-8");
    console.log(`\n📄 Report written to: ${outputPath}\n`);
  }

  if (format === "json" && !outputFile) {
    console.log(formatReportJSON(report));
  } else if (!outputFile) {
    console.log(formatReportMarkdown(report));
  }

  // ── Verbose Details ─────────────────────────────────────────────────────

  if (verbose) {
    console.log("\n📋 Detailed Results:\n");
    for (const agent of report.agents) {
      const icon =
        agent.status === "pass" ? "✅" : agent.status === "warn" ? "⚠️" : "❌";
      console.log(`${icon} ${agent.agent} (${agent.duration}ms)`);
      if (agent.details) {
        for (const d of agent.details) {
          const dIcon =
            d.status === "pass" ? "  ✓" : d.status === "warn" ? "  !" : "  ✗";
          console.log(`${dIcon} ${d.check}`);
        }
      }
      console.log("");
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────

  if (!quiet) {
    console.log("─".repeat(50));
    console.log(
      `⏱️  Duration: ${duration}ms | Health: ${report.healthScore}/100 | Status: ${report.overallStatus}`
    );
    console.log(
      `📊 Checks: ${report.summary.totalChecks} total, ${report.summary.totalPassed} passed, ${report.summary.totalFailed} failed, ${report.summary.totalWarnings} warnings`
    );
    console.log("─".repeat(50));
  }

  // ── Exit Code ───────────────────────────────────────────────────────────

  if (exitOnFail && report.summary.totalFailed > 0) {
    process.exit(1);
  }

  if (report.overallStatus === "failing") {
    process.exit(1);
  }

  process.exit(0);
}

main();
