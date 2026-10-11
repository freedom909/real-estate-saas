import "dotenv/config";

import mongoose from "mongoose";
import { connectMongo } from "./src/shared/db/mongo";
import UserModel from "./src/subgraphs/user/infra/models/user.model";
import AdminUserModel from "./src/core/admin/infrastructure/models/adminUser.model";
import { connectMySQL } from "./src/infrastructure/config/seq";

async function main() {
  const email = "mpeg56@gmail.com";
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not configured");
  }

  await connectMySQL();
  await connectMongo(mongoUri);

  const mongoUser = await UserModel.findOne({
    email: email.toLowerCase(),
  }).lean();

  const adminRows = await AdminUserModel.findAll({
    where: { email },
  });

  console.log("\n=== MONGODB USER ===");
  console.log(
    mongoUser
      ? {
          id: String(mongoUser._id),
          email: mongoUser.email,
          globalRole: mongoUser.globalRole,
          role: mongoUser.role,
          status: mongoUser.status,
        }
      : null
  );

  console.log("\n=== MYSQL ADMIN_USER ===");
  console.log(
    adminRows.map((row) => {
      const data = row.toJSON() as any;
      return {
        id: data.id,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
        immutable: data.immutable,
      };
    })
  );

  await mongoose.disconnect();
  await AdminUserModel.sequelize?.close();
}

main().catch((error) => {
  console.error("Diagnostic failed:", error);
  process.exitCode = 1;
});
