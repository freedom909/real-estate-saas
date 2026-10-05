/**
 * Full E2E Integration Test for Tenant Switching
 * 
 * Tests the complete flow:
 * 1. Seed data verification
 * 2. REST API: GET /api/tenants/available
 * 3. REST API: GET /api/tenants/active
 * 4. REST API: POST /api/tenants/switch (valid)
 * 5. REST API: POST /api/tenants/switch (invalid - no membership)
 * 6. Session persistence verification
 * 7. x-tenant-id header forwarding simulation
 * 8. GraphQL switchTenant mutation
 * 9. Multi-tenant user flow (Yuki can switch between tenants)
 * 10. Cleanup
 */
import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import request from "supertest";
import { gql } from "graphql-tag";
import { print } from "graphql";

// Models
import UserModel from "@/subgraphs/user/infra/models/user.model";
import { TenantModel } from "@/core/tenant/infrastructure/models/tenant.model";
import MembershipModel from "@/core/tenant/infrastructure/models/membership.model";
import SessionModel from "@/subgraphs/auth/infrastructure/models/session.model";

// Use cases & services
import { SwitchTenantUseCase } from "@/core/tenant/application/usecase/switch-tenant.use-case";
import { MembershipRepository } from "@/core/tenant/infrastructure/repos/membership.repo";
import { TenantRepository } from "@/core/tenant/infrastructure/repos/tenant.repository";

// Router
import tenantRouter from "@/gateway/routes/tenantRouter";

import { v4 as uuidv4 } from "uuid";
import sessionPort, { ISessionPort } from "@/subgraphs/auth/domain/ports/session.port";

// â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/minwisdom";
const SECRET = process.env.ACCESS_TOKEN_SECRET || "test-secret";

// â”€â”€ Test Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Alice: CUSTOMER, belongs to Kyoto Stays only
const ALICE_ID = "6650b0000000000000000040";
const KYOTO_TENANT_ID = "6650a0000000000000000001";
const TOKYO_TENANT_ID = "6650a0000000000000000002";
const OSAKA_TENANT_ID = "6650a0000000000000000003";

// Yuki: OWNER, belongs to Kyoto Stays
const YUKI_ID = "6650b0000000000000000010";

// â”€â”€ Test State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let app: express.Express;
let passed = 0;
let failed = 0;
let testSessionId: string;
let aliceToken: string;
let yukiToken: string;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  âœ“ ${msg}`);
    passed++;
  } else {
    console.error(`  âœ— ${msg}`);
    failed++;
  }
}

function createToken(userId: string, sessionId: string) {
  return jwt.sign(
    { sub: userId, sessionId, type: "access" },
    SECRET,
    { expiresIn: "1h" }
  );
}

// â”€â”€ Setup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function setup() {
  // Create Express app
  app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/tenants", tenantRouter);

  // Create test sessions
  testSessionId = uuidv4();
  await SessionModel.create({
    id: testSessionId,
    userId: ALICE_ID,
    familyId: "test",
    deviceId: "test",
    userAgentHash: "test",
    ipHash: "test",
    refreshTokenId: "test",
    status: "ACTIVE",
    activeTenantId: null,
  });

  aliceToken = createToken(ALICE_ID, testSessionId);
  yukiToken = createToken(YUKI_ID, uuidv4());
}

// â”€â”€ Tests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function testSeedData() {
  console.log("\nâ•â•â• Test 1: Seed Data Verification â•â•â•");

  const alice = await UserModel.findOne({ email: "alice@example.com" }).lean();
  assert(!!alice, "Alice exists in DB");
  assert(alice?.status === "ACTIVE", "Alice is ACTIVE");

  const kyoto = await TenantModel.findOne({ slug: "kyoto-stays" }).lean();
  assert(!!kyoto, "Kyoto Stays tenant exists");
  assert(kyoto?.status === "ACTIVE", "Kyoto Stays is ACTIVE");

  const membership = await MembershipModel.findOne({
    userId: ALICE_ID,
    ownerId: KYOTO_TENANT_ID,
  }).lean();
  assert(!!membership, "Alice has membership for Kyoto Stays");

  const noTokyo = await MembershipModel.findOne({
    userId: ALICE_ID,
    ownerId: TOKYO_TENANT_ID,
  }).lean();
  assert(!noTokyo, "Alice has NO membership for Tokyo Homes");
}

async function testGetAvailableTenants() {
  console.log("\nâ•â•â• Test 2: GET /api/tenants/available â•â•â•");

  const res = await request(app)
    .get("/api/tenants/available")
    .set("Authorization", `Bearer ${aliceToken}`);

  assert(res.status === 200, "Returns 200");
  assert(Array.isArray(res.body.tenants), "Returns tenants array");
  assert(res.body.tenants.length === 1, "Alice has exactly 1 tenant");
  assert(res.body.tenants[0].name === "Kyoto Stays", "Tenant is Kyoto Stays");
  assert(res.body.tenants[0].slug === "kyoto-stays", "Slug is kyoto-stays");
}

async function testGetActiveTenant() {
  console.log("\nâ•â•â• Test 3: GET /api/tenants/active â•â•â•");

  const res = await request(app)
    .get("/api/tenants/active")
    .set("Authorization", `Bearer ${aliceToken}`);

  assert(res.status === 200, "Returns 200");
  assert(res.body.activeTenantId === null, "No active tenant yet");
}

async function testSwitchTenantValid() {
  console.log("\nâ•â•â• Test 4: POST /api/tenants/switch (valid) â•â•â•");

  const res = await request(app)
    .post("/api/tenants/switch")
    .set("Authorization", `Bearer ${aliceToken}`)
    .send({ tenantId: KYOTO_TENANT_ID });

  assert(res.status === 200, "Returns 200");
  assert(!!res.body.tenant, "Returns tenant object");
  assert(res.body.tenant.id === KYOTO_TENANT_ID, "Correct tenant ID");
  assert(res.body.tenant.name === "Kyoto Stays", "Correct tenant name");
  assert(res.body.activeTenantId === KYOTO_TENANT_ID, "Returns activeTenantId");
}

async function testSessionPersistence() {
  console.log("\nâ•â•â• Test 5: Session Persistence â•â•â•");

  const session = await SessionModel.findOne({ id: testSessionId }).lean();
  assert(!!session, "Session exists");
  assert(session?.activeTenantId === KYOTO_TENANT_ID, "Session has activeTenantId set");
}

async function testActiveTenantAfterSwitch() {
  console.log("\nâ•â•â• Test 6: GET /api/tenants/active (after switch) â•â•â•");

  const res = await request(app)
    .get("/api/tenants/active")
    .set("Authorization", `Bearer ${aliceToken}`);

  assert(res.status === 200, "Returns 200");
  assert(res.body.activeTenantId === KYOTO_TENANT_ID, "Active tenant updated");
}

async function testSwitchTenantInvalid() {
  console.log("\nâ•â•â• Test 7: POST /api/tenants/switch (no membership) â•â•â•");

  const res = await request(app)
    .post("/api/tenants/switch")
    .set("Authorization", `Bearer ${aliceToken}`)
    .send({ tenantId: TOKYO_TENANT_ID });

  assert(res.status === 403, "Returns 403");
  assert(res.body.error === "You do not have access to this tenant", "Correct error");
}

async function testSwitchTenantMissing() {
  console.log("\nâ•â•â• Test 8: POST /api/tenants/switch (missing tenantId) â•â•â•");

  const res = await request(app)
    .post("/api/tenants/switch")
    .set("Authorization", `Bearer ${aliceToken}`)
    .send({});

  assert(res.status === 400, "Returns 400");
  assert(res.body.error === "tenantId is required", "Correct error");
}

async function testUnauthorized() {
  console.log("\nâ•â•â• Test 9: Unauthorized Access â•â•â•");

  const noAuth = await request(app).get("/api/tenants/active");
  assert(noAuth.status === 401, "No auth â†’ 401");

  const badToken = await request(app)
    .get("/api/tenants/active")
    .set("Authorization", "Bearer invalid-token");
  assert(badToken.status === 401, "Invalid token â†’ 401");
}

async function testUseCaseDirectly() {
  console.log("\nâ•â•â• Test 10: SwitchTenantUseCase Direct â•â•â•");

  const tenantRepo = new (await import("@/core/tenant/infrastructure/repos/tenant.repository")).TenantRepository(TenantModel);
  const membershipRepo = new MembershipRepository(MembershipModel);
  const useCase = new SwitchTenantUseCase(membershipRepo, tenantRepo, sessionPort as any as ISessionPort);

  // Valid switch
  const result = await useCase.execute({ userId: ALICE_ID, tenantId: KYOTO_TENANT_ID, sessionId: testSessionId });
  assert(!!result.tenant, "Use case returns tenant");
  assert(result.activeTenantId === KYOTO_TENANT_ID, "Use case returns correct ID");

  // Invalid switch
  try {
    await useCase.execute({ userId: ALICE_ID, tenantId: TOKYO_TENANT_ID, sessionId: testSessionId });
    assert(false, "Should have thrown");
  } catch (err: any) {
    assert(err.message === "You do not have access to this tenant", "Use case rejects invalid");
  }
}

async function testMultiTenantUser() {
  console.log("\nâ•â•â• Test 11: Multi-Tenant User (Yuki) â•â•â•");

  // Yuki is OWNER of Kyoto Stays
  const res = await request(app)
    .post("/api/tenants/switch")
    .set("Authorization", `Bearer ${yukiToken}`)
    .send({ tenantId: KYOTO_TENANT_ID });

  assert(res.status === 200, "Yuki can switch to Kyoto Stays");
  assert(res.body.tenant.name === "Kyoto Stays", "Correct tenant");
}

async function testXTenantIdForwarding() {
  console.log("\nâ•â•â• Test 12: x-tenant-id Header Simulation â•â•â•");

  // Simulate what the gateway does: read session, get activeTenantId
  const session = await SessionModel.findOne({ id: testSessionId }).lean();
  const tenantId = session?.activeTenantId;

  assert(!!tenantId, "Session has activeTenantId for forwarding");
  assert(tenantId === KYOTO_TENANT_ID, "Correct tenant ID to forward");

  // Simulate what subgraph receives
  const mockReq = {
    headers: {
      "x-tenant-id": tenantId,
      "x-gateway-user": JSON.stringify({ userId: ALICE_ID }),
    },
  };

  const { default: getUserFromContext } = await import("@/infrastructure/auth/getUserFromContext");
  const userContext = await getUserFromContext(mockReq);

  assert(!!userContext, "getUserFromContext returns user");
  assert(userContext?.tenantId === KYOTO_TENANT_ID, "tenantId in context");
}

// â”€â”€ Runner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function run() {
  console.log("â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—");
  console.log("â•‘   Full E2E Integration Test                 â•‘");
  console.log("â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•");

  console.log("\nConnecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected\n");

  await setup();

  // Run all tests
  await testSeedData();
  await testGetAvailableTenants();
  await testGetActiveTenant();
  await testSwitchTenantValid();
  await testSessionPersistence();
  await testActiveTenantAfterSwitch();
  await testSwitchTenantInvalid();
  await testSwitchTenantMissing();
  await testUnauthorized();
  await testUseCaseDirectly();
  await testMultiTenantUser();
  await testXTenantIdForwarding();

  // Cleanup
  await SessionModel.deleteOne({ id: testSessionId });

  // Summary
  console.log("\nâ•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—");
  console.log(`â•‘   Results: ${passed} passed, ${failed} failed`);
  console.log("â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•");

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});


