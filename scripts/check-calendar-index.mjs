// scripts/check-calendar-index.mjs
//
// Verifies that the `calendar_slots` table in the MySQL database has the
// unique index `uq_calendar_listing_date (listingId, date)`.
//
// The index is the LAST LINE OF DEFENSE against concurrent double-booking:
// ReserveSlotUseCase relies on it to reject a raced second INSERT for the
// same (listingId, date). Without it, only the check-then-act guard remains.
//
// Usage:
//   node scripts/check-calendar-index.mjs          # check only (exit 0 = ok, 2 = missing)
//   node scripts/check-calendar-index.mjs --fix    # add the index if missing
//
// Connection uses the same env vars as migrations/run-calendar-migration.ts:
//   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

import "dotenv/config";
import mysql from "mysql2/promise";

const FIX = process.argv.includes("--fix");
const TABLE = "calendar_slots";
const INDEX = "uq_calendar_listing_date";

const cfg = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

console.log(`[check-calendar-index] target: ${cfg.user}@${cfg.host}:${cfg.port}/${cfg.database}`);

const conn = await mysql.createConnection(cfg);
try {
  const [tables] = await conn.query("SHOW TABLES LIKE ?", [TABLE]);
  if (tables.length === 0) {
    console.error(`❌ table "${TABLE}" does NOT exist — run: npm run db:migrate:calendar`);
    process.exit(2);
  }

  const [rows] = await conn.query(
    `SELECT INDEX_NAME, NON_UNIQUE, SEQ_IN_INDEX, COLUMN_NAME
       FROM information_schema.statistics
      WHERE table_schema = ? AND table_name = ?
      ORDER BY INDEX_NAME, SEQ_IN_INDEX`,
    [cfg.database, TABLE]
  );

  const byName = new Map();
  for (const r of rows) {
    if (!byName.has(r.INDEX_NAME)) byName.set(r.INDEX_NAME, []);
    byName.get(r.INDEX_NAME).push(`${r.COLUMN_NAME}${r.NON_UNIQUE ? "" : " (unique)"}`);
  }
  console.log(`[check-calendar-index] indexes on ${TABLE}:`);
  for (const [name, cols] of byName) console.log(`  - ${name}: ${cols.join(", ")}`);

  const [[{ n }]] = await conn.query(`SELECT COUNT(*) AS n FROM ${TABLE}`);
  console.log(`[check-calendar-index] rows in ${TABLE}: ${n}`);
  const [dupes] = await conn.query(
    `SELECT listingId, date, COUNT(*) AS c FROM ${TABLE}
      GROUP BY listingId, date HAVING c > 1 LIMIT 5`
  );
  if (dupes.length > 0) {
    console.error(`⚠️ duplicate (listingId, date) rows found — unique index creation will fail until these are resolved:`);
    for (const d of dupes) console.error(`    ${d.listingId} ${d.date} x${d.c}`);
  }

  const idxCols = rows
    .filter((r) => r.INDEX_NAME === INDEX)
    .sort((a, b) => a.SEQ_IN_INDEX - b.SEQ_IN_INDEX)
    .map((r) => r.COLUMN_NAME);
  const isUnique = rows.some((r) => r.INDEX_NAME === INDEX && r.NON_UNIQUE === 0);
  const ok = isUnique && idxCols.join("+") === "listingId+date";

  if (ok) {
    console.log(`✅ ${INDEX} (UNIQUE listingId+date) exists`);
    process.exit(0);
  }

  if (!FIX) {
    console.error(`❌ ${INDEX} is missing or wrong (got: ${idxCols.join("+") || "nothing"}, unique=${isUnique})`);
    console.error(`   re-run with --fix to add it`);
    process.exit(2);
  }

  if (idxCols.length > 0) {
    console.error(`⚠️ ${INDEX} exists but is wrong — fix manually (ALTER TABLE ... DROP INDEX / ADD UNIQUE)`);
    process.exit(2);
  }

  console.log(`[check-calendar-index] adding UNIQUE ${INDEX} (listingId, date) ...`);
  // Adding the unique index also fails (loudly) if duplicate (listingId, date)
  // rows already exist — which would itself indicate past double-inserts.
  await conn.query(`ALTER TABLE ${TABLE} ADD UNIQUE KEY ${INDEX} (listingId, date)`);
  console.log(`✅ ${INDEX} created`);
} finally {
  await conn.end();
}
