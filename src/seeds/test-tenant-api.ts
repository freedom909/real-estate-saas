/**
 * E2E test for tenant switching REST API routes.
 * Tests the routes directly without requiring running subgraphs.
 */
import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import request from "supertest";
import tenantRouter from "@/gateway/routes/tenantRouter";
import UserModel from "@/subgraphs/user/models/user.model";
import { TenantModel } from "@/core/tenant/infrastructure/models/tenant.model";
import MembershipModel from "@/subgraphs/user/models/membership.model";
import SessionModel from "@/subgraphs/auth/infrastructure/models/session.model";
import { v4 as uuidv4 } from "uuid";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/minwisdom";
const SECRET = process.env.ACCESS_TOKEN_SECRET || "test-secret";

// Test data
const ALICE_ID = "6650b0000000000000000040";
const KYOTO_TENANT_ID = "6650a0000000000000000001";
const TOKYO_TENANT_ID = "6650a0000000000000000002";

let passed = 0;
let failed = 0;
let app: express.Express;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✓ ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ ${msg}`);
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

async function setup() {
  // Create Express app with tenant router
  app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/tenants", tenantRouter);
}

async function test() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected\n");

  await setup();

  // Create test session
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

  const token = createToken(ALICE_ID, sessionId);

  // ── Test 1: GET /api/tenants/active — no tenant yet ────────
  console.log("Test 1: GET /api/tenants/active (no tenant yet)");
  const activeRes = await request(app)
    .get("/api/tenants/active")
    .set("Authorization", `Bearer ${token}`);
  assert(activeRes.status === 200, "Returns 200");
  assert(activeRes.body.activeTenantId === null, "activeTenantId is null");

  // ── Test 2: GET /api/tenants/available — list Alice's tenants ─
  console.log("\nTest 2: GET /api/tenants/available");
  const availableRes = await request(app)
    .get("/api/tenants/available")
    .set("Authorization", `Bearer ${token}`);
  console.log("  Response:", JSON.stringify(availableRes.body, null, 2));
  assert(availableRes.status === 200, "Returns 200");
  assert(Array.isArray(availableRes.body.tenants), "Returns tenants array");
  assert(availableRes.body.tenants.length >= 1, "Alice has at least 1 tenant");
  assert(
    availableRes.body.tenants.some((t: any) => t.name === "Kyoto Stays"),
    "Includes Kyoto Stays"
  );

  // ── Test 3: POST /api/tenants/switch — valid tenant ─────────
  console.log("\nTest 3: POST /api/tenants/switch (valid tenant)");
  const switchRes = await request(app)
    .post("/api/tenants/switch")
    .set("Authorization", `Bearer ${token}`)
    .send({ tenantId: KYOTO_TENANT_ID });
  assert(switchRes.status === 200, "Returns 200");
  assert(!!switchRes.body.tenant, "Returns tenant");
  assert(switchRes.body.tenant.name === "Kyoto Stays", "Correct tenant name");
  assert(switchRes.body.activeTenantId === KYOTO_TENANT_ID, "Correct activeTenantId");

  // ── Test 4: GET /api/tenants/active — after switch ──────────
  console.log("\nTest 4: GET /api/tenants/active (after switch)");
  const activeAfterRes = await request(app)
    .get("/api/tenants/active")
    .set("Authorization", `Bearer ${token}`);
  assert(activeAfterRes.status === 200, "Returns 200");
  assert(activeAfterRes.body.activeTenantId === KYOTO_TENANT_ID, "activeTenantId updated");

  // ── Test 5: POST /api/tenants/switch — invalid tenant (no membership) ──
  console.log("\nTest 5: POST /api/tenants/switch (no membership)");
  const invalidRes = await request(app)
    .post("/api/tenants/switch")
    .set("Authorization", `Bearer ${token}`)
    .send({ tenantId: TOKYO_TENANT_ID });
  assert(invalidRes.status === 403, "Returns 403");
  assert(
    invalidRes.body.error === "You do not have access to this tenant",
    "Correct error message"
  );

  // ── Test 6: POST /api/tenants/switch — missing tenantId ─────
  console.log("\nTest 6: POST /api/tenants/switch (missing tenantId)");
  const missingRes = await request(app)
    .post("/api/tenants/switch")
    .set("Authorization", `Bearer ${token}`)
    .send({});
  assert(missingRes.status === 400, "Returns 400");
  assert(missingRes.body.error === "tenantId is required", "Correct error message");

  // ── Test 7: No auth header ─────────────────────────────────
  console.log("\nTest 7: No auth header");
  const noAuthRes = await request(app)
    .get("/api/tenants/active");
  assert(noAuthRes.status === 401, "Returns 401");

  // ── Test 8: Invalid token ──────────────────────────────────
  console.log("\nTest 8: Invalid token");
  const badTokenRes = await request(app)
    .get("/api/tenants/active")
    .set("Authorization", "Bearer invalid-token");
  assert(badTokenRes.status === 401, "Returns 401");

  // Cleanup
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
