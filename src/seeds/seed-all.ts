//src/seeds/seed-all.ts

import "dotenv/config";
import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8"]);

import UserModel from "@/subgraphs/user/infra/models/user.model";
import { TenantModel, TenantStatus } from "@/core/tenant/infrastructure/models/tenant.model";
import MembershipModel from "@/core/tenant/infrastructure/models/membership.model";
import {
  GlobalRole,
  MembershipRole,
} from "@/core/shared/domain/role";

const USER_IDS = {
  SUPER_ADMIN: new mongoose.Types.ObjectId("6650b0000000000000000001"),
  ADMIN: new mongoose.Types.ObjectId("6650b0000000000000000050"),

  OWNER: new mongoose.Types.ObjectId("6650b0000000000000000010"),
  HOST: new mongoose.Types.ObjectId("6650b0000000000000000011"),
  AGENT: new mongoose.Types.ObjectId("6650b0000000000000000012"),
  STAFF: new mongoose.Types.ObjectId("6650b0000000000000000013"),

  CUSTOMER_1: new mongoose.Types.ObjectId("6650b0000000000000000040"),
  CUSTOMER_2: new mongoose.Types.ObjectId("6650b0000000000000000041"),
};

const TENANT_IDS = {
  KYOTO: new mongoose.Types.ObjectId("6650a0000000000000000001"),
};

const USERS = [
  {
    _id: USER_IDS.SUPER_ADMIN,
    email: "superadmin@example.com",
    name: "Super Admin",
    globalRole: GlobalRole.SUPER_ADMIN,
  },
  {
    _id: USER_IDS.ADMIN,
    email: "admin@example.com",
    name: "Platform Admin",
    globalRole: GlobalRole.ADMIN,
  },
  {
    _id: USER_IDS.OWNER,
    email: "owner@kyotostays.com",
    name: "Kyoto Owner",
    globalRole: GlobalRole.CUSTOMER,
  },
  {
    _id: USER_IDS.HOST,
    email: "host@kyotostays.com",
    name: "Kyoto Host",
    globalRole: GlobalRole.CUSTOMER,
  },
  {
    _id: USER_IDS.AGENT,
    email: "agent@kyotostays.com",
    name: "Kyoto Agent",
    globalRole: GlobalRole.CUSTOMER,
  },
  {
    _id: USER_IDS.STAFF,
    email: "staff@kyotostays.com",
    name: "Kyoto Staff",
    globalRole: GlobalRole.CUSTOMER,
  },
  {
    _id: USER_IDS.CUSTOMER_1,
    email: "alice@example.com",
    name: "Alice Chen",
    globalRole: GlobalRole.CUSTOMER,
  },
  {
    _id: USER_IDS.CUSTOMER_2,
    email: "bob@example.com",
    name: "Bob Wilson",
    globalRole: GlobalRole.CUSTOMER,
  },
];

const TENANTS = [
  {
    _id: TENANT_IDS.KYOTO,
    name: "Kyoto Stays",
    slug: "kyoto-stays",
    ownerUserId: USER_IDS.OWNER.toString(),
    status: TenantStatus.ACTIVE,
  },
];

const MEMBERSHIPS = [
  {
    userId: USER_IDS.OWNER,
    tenantId: TENANT_IDS.KYOTO,
    role: MembershipRole.OWNER,
  },
  {
    userId: USER_IDS.HOST,
    tenantId: TENANT_IDS.KYOTO,
    role: MembershipRole.HOST,
  },
  {
    userId: USER_IDS.AGENT,
    tenantId: TENANT_IDS.KYOTO,
    role: MembershipRole.AGENT,
  },
  {
    userId: USER_IDS.STAFF,
    tenantId: TENANT_IDS.KYOTO,
    role: MembershipRole.STAFF,
  },
];

async function seed() {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  console.log("Connecting to MongoDB...");

  await mongoose.connect(MONGO_URI);

  console.log("Connected to MongoDB\n");

  /*
   * Development reset.
   *
   * This seed intentionally replaces development data.
   * Do NOT use this script against production data.
   */
  await MembershipModel.deleteMany({});
  await TenantModel.deleteMany({});
  await UserModel.deleteMany({});

  console.log("Cleared development data\n");

  for (const user of USERS) {
    await UserModel.create({
      ...user,
      status: "ACTIVE",
      tokenVersion: 0,
    });

    console.log(
      `User: ${user.email} [globalRole=${user.globalRole}]`
    );
  }

  console.log(`\nSeeded ${USERS.length} users\n`);

  for (const tenant of TENANTS) {
    await TenantModel.create(tenant);

    console.log(
      `Tenant: ${tenant.name} [owner=${tenant.ownerUserId}]`
    );
  }

  console.log(`\nSeeded ${TENANTS.length} tenant\n`);

  for (const membership of MEMBERSHIPS) {
    await MembershipModel.create({
      userId: membership.userId,
      tenantId: membership.tenantId,
      role: membership.role,
      status: "ACTIVE",
    });

    console.log(
      `Membership: ${membership.userId.toString()} -> ${membership.tenantId.toString()} [${membership.role}]`
    );
  }

  console.log(`\nSeeded ${MEMBERSHIPS.length} memberships\n`);

  console.log("── Summary ──");

  console.log(
    `  Users:        ${await UserModel.countDocuments()}`
  );

  console.log(
    `  Tenants:      ${await TenantModel.countDocuments()}`
  );

  console.log(
    `  Memberships:  ${await MembershipModel.countDocuments()}`
  );

  await mongoose.disconnect();

  console.log("\nDone.");
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});