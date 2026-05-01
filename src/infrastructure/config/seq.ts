import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  NODE_ENV
} = process.env;

// ❗ 强制校验（很重要）
if (!DB_NAME || !DB_USER || !DB_PASSWORD) {
  throw new Error("❌ Missing DB environment variables");
}

export const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  {
    host: DB_HOST || 'localhost',
    port: Number(DB_PORT) || 3307,
    dialect: 'mysql',

    logging: NODE_ENV === 'development' ? console.log : false,

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// ✅ 显式连接函数（推荐）
export async function connectMySQL() {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected");
  } catch (err) {
    console.error("❌ MySQL connection failed:", err);
    process.exit(1);
  }
}