import { existsSync } from "fs";
import path from "path";

/**
 * Resolve a schema file path in a module-scope-agnostic way.
 *
 * WHY: under tsx, some entry files are loaded as CommonJS (where `__dirname`
 * exists) and some as ES modules (where it throws ReferenceError). Neither
 * `__dirname` nor `import.meta.url` is safe across both, and a bare
 * process.cwd()-relative path only works when the process starts from the
 * repo root. This helper probes multiple candidates from the current working
 * directory and returns the first that exists.
 *
 * Usage: resolveSchemaPath("src/subgraphs/review/schema.graphql", "schema.graphql")
 *   1st candidate: repo-root-relative (start-backend.cjs / npm scripts)
 *   2nd candidate: file-next-to-entry (started from the subgraph directory)
 */
export function resolveSchemaPath(...candidates: string[]): string {
  for (const candidate of candidates) {
    const resolved = path.resolve(process.cwd(), candidate);
    if (existsSync(resolved)) return resolved;
  }
  throw new Error(
    `Schema file not found. Tried (relative to cwd=${process.cwd()}): ${candidates.join(", ")}`
  );
}
