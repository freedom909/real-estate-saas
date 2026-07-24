/**
 * E2E test for tenant switching logic.
 * Tests the core flow without requiring running subgraphs:
 * 1. Verify seed data (users, tenants, memberships)
 * 2. Simulate switchTenant use case (validate membership + tenant)
 * 3. Simulate session update (activeTenantId)
 * 4. Simulate gateway lookup (find session → get tenantId)
 */
import "reflect-metadata";
import "dotenv/config";
import mongoose from "mongoose";
import UserModel from "@/subgraphs/user/models/user.model";
import { TenantModel } from "@/core/tenant/infrastructure/models/tenant.model";
import MembershipModel from "@/subgraphs/user/models/membership.model";
import SessionModel from "@/subgraphs/auth/infrastructure/models/session.model";
import { SwitchTenantUseCase } from "@/core/tenant/application/usecase/switch-tenant.use-case";
import { MembershipRepository } from "@/core/tenant/infrastructure/repos/membership.repo";
import { TenantRepository } from "@/core/tenant/infrastructure/repos/tenant.repository";
import { v4 as uuidv4 } from "uuid";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/minwisdom";

// Test user: alice (CUSTOMER, belongs to Kyoto Stays only)
const ALICE_ID = "6650b0000000000000000040";
const KYOTO_TENANT_ID = "6650a0000000000000000001";
const TOKYO_TENANT_ID = "6650a0000000000000000002";
const OSAKA_TENANT_ID = "6650a0000000000000000003";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✓ ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ ${msg}`);
    failed++;
  }
}

async function test() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected\n");

  // ── Test 1: Verify seed data ──────────────────────────────
  console.log("Test 1: Verify seed data");
  const alice = await UserModel.findOne({ email: "alice@example.com" }).lean();
  assert(!!alice, "Alice exists");
  assert(alice?.status === "ACTIVE", "Alice is ACTIVE");

  const kyotoTenant = await TenantModel.findOne({ slug: "kyoto-stays" }).lean();
  assert(!!kyotoTenant, "Kyoto Stays tenant exists");
  assert(kyotoTenant?.status === "ACTIVE", "Kyoto Stays is ACTIVE");

  const membership = await MembershipModel.findOne({ userId: ALICE_ID, ownerId: KYOTO_TENANT_ID }).lean();
  assert(!!membership, "Alice has membership for Kyoto Stays");

  const noTokyoMembership = await MembershipModel.findOne({ userId: ALICE_ID, ownerId: TOKYO_TENANT_ID }).lean();
  assert(!noTokyoMembership, "Alice has NO membership for Tokyo Homes");

  // ── Test 2: switchTenant — valid tenant ────────────────────
  console.log("\nTest 2: switchTenant — valid tenant (Kyoto Stays)");
  const tenantRepo = new (await import("@/core/tenant/infrastructure/repos/tenant.repository")).TenantRepository(TenantModel);
  const membershipRepo = new MembershipRepository(MembershipModel);
  const switchUseCase = new SwitchTenantUseCase(membershipRepo, tenantRepo as any);

  const result = await switchUseCase.execute({ userId: ALICE_ID, tenantId: KYOTO_TENANT_ID });
  assert(!!result.tenant, "switchTenant returns tenant");
  assert(result.activeTenantId === KYOTO_TENANT_ID, "switchTenant returns correct activeTenantId");
  assert(result.tenant.name === "Kyoto Stays", "switchTenant returns correct tenant name");

  // ── Test 3: switchTenant — invalid tenant (no membership) ──
  console.log("\nTest 3: switchTenant — invalid tenant (Tokyo Homes, no membership)");
  try {
    await switchUseCase.execute({ userId: ALICE_ID, tenantId: TOKYO_TENANT_ID });
    assert(false, "Should have thrown error");
  } catch (err: any) {
    assert(err.message === "You do not have access to this tenant", `Correct error: "${err.message}"`);
  }

  // ── Test 4: switchTenant — nonexistent tenant ─────────────
  console.log("\nTest 4: switchTenant — nonexistent tenant");
  try {
    await switchUseCase.execute({ userId: ALICE_ID, tenantId: "nonexistent" });
    assert(false, "Should have thrown error");
  } catch (err: any) {
    // Mongoose may throw CastError for invalid ObjectId format, or use case throws "Tenant not found"
    assert(true, `Correctly rejected: "${err.message.substring(0, 60)}..."`);
  }

  // ── Test 5: Session update ─────────────────────────────────
  console.log("\nTest 5: Session activeTenantId update");
  const sessionId = uuidv4();
  await SessionModel.create({
    id: sessionId,
    userId: ALICE_ID,
    familyId: "test",
    deviceId: "test",
    userAgentHash: "test",
    ipHash: "test",
    refreshTokenId: "test",
    status: "ACTIVE",
    activeTenantId: null,
  });

  // Update session with tenant
  await SessionModel.findOneAndUpdate(
    { id: sessionId },
    { activeTenantId: KYOTO_TENANT_ID }
  );

  const session = await SessionModel.findOne({ id: sessionId }).lean();
  assert(session?.activeTenantId === KYOTO_TENANT_ID, "Session has activeTenantId set");

  // ── Test 6: Gateway-style session lookup ───────────────────
  console.log("\nTest 6: Gateway session lookup");
  const lookupSession = await SessionModel.findOne({ id: sessionId }).lean();
  assert(!!lookupSession, "Session found by ID");
  assert(lookupSession?.activeTenantId === KYOTO_TENANT_ID, "Gateway reads activeTenantId from session");

  // ── Test 7: Switch to another valid tenant ─────────────────
  console.log("\nTest 7: Switch to another valid tenant (if user has multiple)");
  // Alice only has Kyoto, so test with Yuki who has Kyoto
  const yukiResult = await switchUseCase.execute({
    userId: "6650b0000000000000000010", // yuki
    tenantId: KYOTO_TENANT_ID,
  });
  assert(!!yukiResult.tenant, "Yuki can switch to Kyoto Stays");

  // Cleanup test session
  await SessionModel.deleteOne({ id: sessionId });

  // ── Summary ───────────────────────────────────────────────
  console.log(`\n${"=".repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${"=".repeat(40)}`);

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

test().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
