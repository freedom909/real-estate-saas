import { Sequelize } from "sequelize";
import fs from "fs";

// location subgraph — reuse the same MYSQL_* / MYSQL_SSL_* env keys, keeping code style aligned with infrastructure/config/seq.ts
const DB_NAME = process.env.DB_NAME ?? process.env.DB_NAME ?? "nakano";
const DB_USER     = process.env.DB_USER ?? process.env.DB_USER ?? "root";
const DB_PASSWORD = process.env.DB_PASSWORD ?? process.env.DB_PASSWORD ?? "";
const DB_HOST     = process.env.DB_HOST ?? process.env.DB_HOST ?? "127.0.0.1";
const DB_PORT     = Number(process.env.DB_PORT ?? process.env.DB_PORT ?? 3306);
const MYSQL_SSL_MODE = (process.env.MYSQL_SSL_MODE ?? "auto").toLowerCase();
const sslCaPath      = process.env.MYSQL_SSL_CA;

let dialectOptions: Record<string, unknown> | undefined = undefined;
if (MYSQL_SSL_MODE !== "disabled") {
  if (sslCaPath && fs.existsSync(sslCaPath)) {
    dialectOptions = { ssl: { ca: fs.readFileSync(sslCaPath, "utf8") } };
  } else if (MYSQL_SSL_MODE === "required" || MYSQL_SSL_MODE === "preferred" || MYSQL_SSL_MODE === "verify-ca") {
    dialectOptions = { ssl: MYSQL_SSL_MODE === "verify-ca" ? {} : { rejectUnauthorized: false } };
  }
}

if (!DB_PASSWORD && !(process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test")) {
  throw new Error("❌ location/subgraph: Missing DB_PASSWORD (and not dev/test).");
}

export const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  {
    host: DB_HOST,
    port: DB_PORT,
    dialect: "mysql",
    logging: (process.env.NODE_ENV === "development") ? console.log : false,
    pool: { max: 10, min: 1, acquire: 30000, idle: 15000 },
    define: { timestamps: true },
    ...(dialectOptions ? { dialectOptions } : {}),
  }
);