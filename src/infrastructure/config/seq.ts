import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Aliyun RDS / self-hosted MySQL compatible env keys:
// Prefer explicit MYSQL_* keys; fall back to legacy DB_* for backwards compatibility.
const DB_NAME = process.env.DB_NAME ?? process.env.DB_NAME;
const DB_USER     = process.env.DB_USER ?? process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD ?? process.env.DB_PASSWORD;
const DB_HOST     = process.env.DB_HOST ?? process.env.DB_HOST ?? "127.0.0.1";
const DB_PORT     = Number(process.env.DB_PORT ?? process.env.DB_PORT ?? 3306);
const NODE_ENV       = process.env.NODE_ENV;

if (!DB_NAME || !DB_USER || !DB_PASSWORD) {
  throw new Error(
    "❌ Missing MySQL env variables. Set DB_NAME, DB_USER, DB_PASSWORD (legacy DB_* keys also accepted)."
  );
}

// ---------- SSL / TLS handling (Aliyun RDS 推荐开启 SSL 接入层) ----------
const MYSQL_SSL_MODE = (process.env.MYSQL_SSL_MODE ?? "auto").toLowerCase();
// auto: 如果提供了 CA 路径 → require; 否则 false
// required / preferred / disabled / verify-ca
let dialectOptions: Record<string, unknown> | undefined = undefined;
const sslCaPath = process.env.MYSQL_SSL_CA;
if (MYSQL_SSL_MODE !== "disabled") {
  if (sslCaPath && fs.existsSync(sslCaPath)) {
    dialectOptions = {
      ssl: { ca: fs.readFileSync(sslCaPath, "utf8") },
    };
  } else if (MYSQL_SSL_MODE === "required" || MYSQL_SSL_MODE === "preferred" || MYSQL_SSL_MODE === "verify-ca") {
    dialectOptions = {
      ssl: MYSQL_SSL_MODE === "verify-ca" ? {} : { rejectUnauthorized: false },
    };
  }
}

export const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  {
    host: DB_HOST,
    port: DB_PORT,
    dialect: "mysql",

    logging: NODE_ENV === "development" ? console.log : false,

    pool: {
      max: 20,
      min: 2,
      acquire: 30000,
      idle: 15000,
    },

    define: {
      timestamps: true,
      underscored: false,
    },

    ...(dialectOptions ? { dialectOptions } : {}),
  }
);

// ======================================================
// Connection
// ======================================================

export async function connectMySQL() {
  try {
    await sequelize.authenticate();
    console.log(`✅ MySQL connected at ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME} (ssl=${MYSQL_SSL_MODE})`);
  } catch (err) {
    console.error("❌ MySQL connection failed:", err);
    process.exit(1);
  }
}
