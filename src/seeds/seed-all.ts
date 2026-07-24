import "dotenv/config";
import mongoose from "mongoose";
import UserModel from "@/subgraphs/user/models/user.model";
import { TenantModel } from "@/core/tenant/infrastructure/models/tenant.model";
import MembershipModel from "@/subgraphs/user/models/membership.model";
import { Role } from "@/core/shared/domain/role";

// ── Tenants ──────────────────────────────────────────────
const TENANTS = [
  { _id: new mongoose.Types.ObjectId("6650a0000000000000000001"), name: "Kyoto Stays", slug: "kyoto-stays", ownerUserId: "6650b0000000000000000010", status: "ACTIVE" },
  { _id: new mongoose.Types.ObjectId("6650a0000000000000000002"), name: "Tokyo Homes", slug: "tokyo-homes", ownerUserId: "6650b0000000000000000020", status: "ACTIVE" },
  { _id: new mongoose.Types.ObjectId("6650a0000000000000000003"), name: "Osaka Living", slug: "osaka-living", ownerUserId: "6650b0000000000000000030", status: "ACTIVE" },
];

// ── Users ────────────────────────────────────────────────
const USERS = [
  // Super admin (no tenant)
  { _id: new mongoose.Types.ObjectId("6650b0000000000000000001"), email: "superadmin@example.com", name: "Super Admin", role: Role.SUPER_ADMIN, status: "ACTIVE" },

  // Kyoto Stays team
  { _id: new mongoose.Types.ObjectId("6650b0000000000000000010"), email: "yuki@kyotostays.com", name: "Yuki Tanaka", role: Role.OWNER, status: "ACTIVE" },
  { _id: new mongoose.Types.ObjectId("6650b0000000000000000011"), email: "kenji@kyotostays.com", name: "Kenji Yamamoto", role: Role.AGENT, status: "ACTIVE" },
  { _id: new mongoose.Types.ObjectId("6650b0000000000000000012"), email: "sato@kyotostays.com", name: "Sato Ichiro", role: Role.STAFF, status: "ACTIVE" },

  // Tokyo Homes team
  { _id: new mongoose.Types.ObjectId("6650b0000000000000000020"), email: "akira@tokyohomes.com", name: "Akira Suzuki", role: Role.OWNER, status: "ACTIVE" },
  { _id: new mongoose.Types.ObjectId("6650b0000000000000000021"), email: "miho@tokyohomes.com", name: "Miho Kobayashi", role: Role.AGENT, status: "ACTIVE" },

  // Osaka Living team
  { _id: new mongoose.Types.ObjectId("6650b0000000000000000030"), email: "takeshi@osakaliving.com", name: "Takeshi Watanabe", role: Role.OWNER, status: "ACTIVE" },

  // Customers (cross-tenant)
  { _id: new mongoose.Types.ObjectId("6650b0000000000000000040"), email: "alice@example.com", name: "Alice Chen", role: Role.CUSTOMER, status: "ACTIVE" },
  { _id: new mongoose.Types.ObjectId("6650b0000000000000000041"), email: "bob@example.com", name: "Bob Wilson", role: Role.CUSTOMER, status: "ACTIVE" },
  { _id: new mongoose.Types.ObjectId("6650b0000000000000000042"), email: "carol@example.com", name: "Carol Martinez", role: Role.CUSTOMER, status: "SUSPENDED" },

  // Moderators / admins
  { _id: new mongoose.Types.ObjectId("6650b0000000000000000050"), email: "admin@example.com", name: "Platform Admin", role: Role.ADMIN, status: "ACTIVE" },
  { _id: new mongoose.Types.ObjectId("6650b0000000000000000051"), email: "mod@example.com", name: "Content Mod", role: Role.MODERATOR, status: "ACTIVE" },
];

// ── Memberships ──────────────────────────────────────────
// Links users to tenants with a role scope
const MEMBERSHIPS = [
  // Kyoto Stays
  { userId: "6650b0000000000000000010", ownerId: "6650a0000000000000000001", role: Role.OWNER },
  { userId: "6650b0000000000000000011", ownerId: "6650a0000000000000000001", role: Role.AGENT },
  { userId: "6650b0000000000000000012", ownerId: "6650a0000000000000000001", role: Role.STAFF },

  // Tokyo Homes
  { userId: "6650b0000000000000000020", ownerId: "6650a0000000000000000002", role: Role.OWNER },
  { userId: "6650b0000000000000000021", ownerId: "6650a0000000000000000002", role: Role.AGENT },

  // Osaka Living
  { userId: "6650b0000000000000000030", ownerId: "6650a0000000000000000003", role: Role.OWNER },

  // Customers belong to Kyoto Stays (booked there)
  { userId: "6650b0000000000000000040", ownerId: "6650a0000000000000000001", role: Role.CUSTOMER },
  { userId: "6650b0000000000000000041", ownerId: "6650a0000000000000000002", role: Role.CUSTOMER },
];

// ── Seed runner ──────────────────────────────────────────
async function seed() {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mie";
  console.log(`Connecting to ${MONGO_URI} ...`);
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB\n");

  // Tenants — drop collection to clear stale indexes from old model
  await mongoose.connection.db.dropCollection("tenants").catch(() => {});
  for (const t of TENANTS) {
    await TenantModel.create(t);
    console.log(`  Tenant: ${t.name}`);
  }
  console.log(`Seeded ${TENANTS.length} tenants`);

  // Users
  await UserModel.deleteMany({});
  for (const u of USERS) {
    await UserModel.create({ ...u, tokenVersion: 0 });
    console.log(`  User:   ${u.email} (${u.role})`);
  }
  console.log(`Seeded ${USERS.length} users`);

  // Memberships
  await MembershipModel.deleteMany({});
  for (const m of MEMBERSHIPS) {
    await MembershipModel.create({
      userId: new mongoose.Types.ObjectId(m.userId),
      ownerId: new mongoose.Types.ObjectId(m.ownerId),
      role: m.role,
    });
    console.log(`  Membership: ${m.userId.slice(-4)} -> ${m.ownerId.slice(-4)} [${m.role}]`);
  }
  console.log(`Seeded ${MEMBERSHIPS.length} memberships`);

  // Summary
  console.log("\n── Summary ──");
  console.log(`  Tenants:      ${await TenantModel.countDocuments()}`);
  console.log(`  Users:        ${await UserModel.countDocuments()}`);
  console.log(`  Memberships:  ${await MembershipModel.countDocuments()}`);

  console.log("\nTest accounts:");
  console.log("  superadmin@example.com  (SUPER_ADMIN, no tenant)");
  console.log("  yuki@kyotostays.com    (OWNER, Kyoto Stays)");
  console.log("  alice@example.com      (CUSTOMER, Kyoto Stays)");
  console.log("  admin@example.com      (ADMIN, platform)");

  await mongoose.disconnect();
  console.log("\nDone.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
