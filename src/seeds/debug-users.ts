//src/seeds/debug-users.ts

import "reflect-metadata";
import "dotenv/config";

import mongoose from "mongoose";

import { connectMongo } from "@/shared/db/mongo";
import UserModel from "@/subgraphs/user/infra/models/user.model";
import MembershipModel from "@/core/tenant/infrastructure/models/membership.model";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sendai";

const TARGET_USER_ID = "6abb7f9f421d9ceeee4a2d89";

async function main() {
  console.log("========================================");
  console.log(" Users / Membership Diagnostic");
  console.log("========================================");

  await connectMongo(MONGO_URI);

  console.log("MongoDB database =", mongoose.connection.name);
  console.log("User collection =", UserModel.collection.name);
  console.log("Membership collection =", MembershipModel.collection.name);

  /*
   * ------------------------------------------------------------
   * Users
   * ------------------------------------------------------------
   */

  const users = await UserModel.find({})
    .select("_id email globalRole status")
    .lean();

  console.log("\nUSERS COUNT =", users.length);

  console.dir(users, { depth: null });

  /*
   * ------------------------------------------------------------
   * Target User
   * ------------------------------------------------------------
   */

  const targetUser = await UserModel.findById(TARGET_USER_ID)
    .select("_id email globalRole status")
    .lean();

  console.log("\nTARGET USER:");
  console.dir(targetUser, { depth: null });

  /*
   * ------------------------------------------------------------
   * Memberships
   * ------------------------------------------------------------
   */

  const memberships = await MembershipModel.find({})
    .select("userId tenantId role status")
    .lean();

  console.log("\nMEMBERSHIPS COUNT =", memberships.length);

  console.dir(memberships, { depth: null });

  /*
   * ------------------------------------------------------------
   * Target User Memberships
   * ------------------------------------------------------------
   */

  const targetMemberships = await MembershipModel.find({
    userId: TARGET_USER_ID,
  })
    .select("userId tenantId role status")
    .lean();

  console.log("\nTARGET USER MEMBERSHIPS:");

  console.dir(targetMemberships, { depth: null });

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("\n========================================");
  console.error(" DIAGNOSTIC FAILED");
  console.error("========================================");
  console.error(error);

  process.exit(1);
});