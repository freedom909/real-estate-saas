// migrations/run-migrations.ts
//
// Generic, idempotent migration runner with a `schema_migrations` tracking table.
// Usage: npm run db:migrate
//
// Applies every migrations/<timestamp>-<name>.ts exporting `up(queryInterface)`
// exactly once, in timestamp order. Re-running is a no-op.

import "dotenv/config";
import { readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Sequelize } from "sequelize";

const __dirname = dirname(fileURLToPath(import.meta.url));

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: false,
  }
);

// <14-digit timestamp>-<name>.ts  (run-migrations.ts / run-calendar-migration.ts excluded)
const MIGRATION_FILE = /^\d{14}-[\w-]+\.ts$/;

async function run() {
  await sequelize.authenticate();
  const qi = sequelize.getQueryInterface();

  await sequelize.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
      name VARCHAR(255) PRIMARY KEY,
      appliedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  );

  const [rows] = (await sequelize.query(
    "SELECT name FROM schema_migrations"
  )) as [Array<{ name: string }>, unknown];
  const applied = new Set(rows.map((r) => r.name));

  const files = readdirSync(__dirname)
    .filter((f) => MIGRATION_FILE.test(f))
    .sort();

  let ran = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    console.log(`[migrate] applying ${file} ...`);
    const mod: any = await import(pathToFileURL(join(__dirname, file)).href);
    if (typeof mod.up !== "function") {
      console.warn(`[migrate] ${file} has no up() export — skipped`);
      continue;
    }
    await mod.up(qi);
    await sequelize.query(
      "INSERT INTO schema_migrations (name) VALUES (:name)",
      { replacements: { name: file } }
    );
    console.log(`[migrate] applied ${file}`);
    ran++;
  }

  console.log(
    ran
      ? `[migrate] done — ${ran} migration(s) applied`
      : "[migrate] up to date — nothing to apply"
  );
}

run()
  .catch((err) => {
    console.error("[migrate] failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
