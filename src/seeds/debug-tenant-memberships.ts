import "reflect-metadata";
import "dotenv/config";

import mongoose from "mongoose";
import { connectMongo } from "@/shared/db/mongo";
import { TenantModel } from "@/core/tenant/infrastructure/models/tenant.model";
import MembershipModel from "@/core/tenant/infrastructure/models/membership.model";
import UserModel from "@/subgraphs/user/infra/models/user.model";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sendai";

const TARGET_USER_ID = "6abca75a134bf08fdc5ec2f1";

async function main() {
  try {
    await connectMongo(MONGO_URI);

    console.log("\nDATABASE =", mongoose.connection.name);

    const tenants = await TenantModel.find({})
      .select("_id name slug status ownerUserId")
      .lean();

    console.log("\n========== TENANTS ==========");
    console.dir(tenants, { depth: null });

    const memberships = await MembershipModel.find({})
      .select("_id userId tenantId role status")
      .lean();

    console.log("\n========== MEMBERSHIPS WITH TENANT NAMES ==========");

    for (const membership of memberships) {
      const tenant = tenants.find(
        (item) => String(item._id) === String(membership.tenantId)
      );

      const user = await UserModel.findById(membership.userId)
        .select("email globalRole")
        .lean();

      console.log({
        userEmail: user?.email ?? "(user not found)",
        userId: String(membership.userId),
        tenantName: tenant?.name ?? "(tenant not found)",
        tenantSlug: tenant?.slug ?? "(unknown)",
        tenantId: String(membership.tenantId),
        role: membership.role,
        status: membership.status,
      });
    }

    const targetMemberships = await MembershipModel.find({
      userId: TARGET_USER_ID,
    })
      .select("userId tenantId role status")
      .lean();

    console.log("\n========== TARGET USER ==========");
    console.log("TARGET USER ID =", TARGET_USER_ID);
    console.dir(targetMemberships, { depth: null });
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("DIAGNOSTIC FAILED:", error);
  process.exitCode = 1;
});
