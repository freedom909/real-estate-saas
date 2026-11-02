// src/migrations/run-calendar-migration.ts

import "dotenv/config";
import { Sequelize } from "sequelize";
import { up } from "./20261102062352-create-calendar-slots";



const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: console.log,
  }
);

async function run() {
  try {
    await sequelize.authenticate();

    console.log("✅ Database connected");

    // カレンダーテーブル作成マイグレーションをインポート
    await up(sequelize.getQueryInterface());

    console.log("✅ Calendar migration completed");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();