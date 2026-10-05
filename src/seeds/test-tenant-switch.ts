// src/seeds/test-tenant-switch.ts

import "reflect-metadata";
import "dotenv/config";

import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { container } from "tsyringe";

import { connectMongo } from "@/shared/db/mongo";

import registerAuthDependencies from "@/subgraphs/auth/registerAuthDependencies";
import UserModel from "@/subgraphs/user/infra/models/user.model";
import SessionModel from "@/subgraphs/auth/infrastructure/models/session.model";

import { TenantModel } from "@/core/tenant/infrastructure/models/tenant.model";
import MembershipModel from "@/core/tenant/infrastructure/models/membership.model";

import { SwitchTenantUseCase } from "@/core/tenant/application/usecase/switch-tenant.use-case";
import { MembershipRepository } from "@/core/tenant/infrastructure/repos/membership.repo";
import { TenantRepository } from "@/core/tenant/infrastructure/repos/tenant.repository";

import { TenantStatus } from "@/core/tenant/domain/entities/tenant.entity";

import { GlobalRole, MembershipRole } from "@/core/shared/domain/role";

import { TOKENS_AUTH } from "@/modules/tokens/auth.tokens";

/*
 * ------------------------------------------------------------
 * MongoDB
 * ------------------------------------------------------------
 */

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/minwisdom";

/*
 * ------------------------------------------------------------
 * Deterministic test IDs
 * ------------------------------------------------------------
 *
 * These are deliberately fixed so the test can be run repeatedly.
 *
 * IMPORTANT:
 * These IDs are only used by this integration test fixture.
 * ------------------------------------------------------------
 */

const ALICE_ID = "6650b0000000000000000040";
const YUKI_ID = "6650b0000000000000000010";

const KYOTO_TENANT_ID = "6650a0000000000000000001";
const TOKYO_TENANT_ID = "6650a0000000000000000002";

/*
 * ------------------------------------------------------------
 * Test fixture helpers
 * ------------------------------------------------------------
 */

/**
 * Ensure a test user exists.
 *
 * We deliberately do NOT overwrite an existing user's role/status.
 * The test only needs the user to exist.
 */
async function ensureUser(
  userId: string,
  email: string,
  name: string
): Promise<void> {
  const existing = await UserModel.findById(userId).lean();

  if (existing) {
    console.log(`✓ User exists: ${email} (${userId})`);
    return;
  }

  await UserModel.create({
    _id: new mongoose.Types.ObjectId(userId),
    email,
    name,
    picture: "",
    globalRole: GlobalRole.CUSTOMER,
    status: "ACTIVE",
    tokenVersion: 0,
  });

  console.log(`✓ Created test user: ${email} (${userId})`);
}

/**
 * Ensure a tenant exists.
 *
 * Existing tenants are not modified.
 */
async function ensureTenant(
  tenantId: string,
  name: string,
  slug: string,
  ownerUserId: string
): Promise<void> {
  const existing = await TenantModel.findById(tenantId).lean();

  if (existing) {
    console.log(`✓ Tenant exists: ${name} (${tenantId})`);
    return;
  }

  await TenantModel.create({
    _id: new mongoose.Types.ObjectId(tenantId),
    name,
    slug,
    ownerUserId,
    status: TenantStatus.ACTIVE,
  });

  console.log(`✓ Created test tenant: ${name} (${tenantId})`);
}

/**
 * Ensure an ACTIVE membership exists.
 *
 * Existing memberships are not changed.
 */
async function ensureMembership(
  userId: string,
  tenantId: string,
  role: MembershipRole
): Promise<void> {
  const existing = await MembershipModel.findOne({
    userId,
    tenantId,
  }).lean();

  if (existing) {
    console.log(
      `✓ Membership exists: ${userId} → ${tenantId} (${existing.role})`
    );
    return;
  }

  await MembershipModel.create({
    userId: new mongoose.Types.ObjectId(userId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
    role,
    status: "ACTIVE",
  });

  console.log(
    `✓ Created membership: ${userId} → ${tenantId} (${role})`
  );
}

/**
 * Ensure Alice does NOT have membership for the test Tokyo tenant.
 *
 * Tokyo is a test fixture tenant, so removing an accidental fixture
 * membership here is safe and makes Test 3 / Test 7 deterministic.
 */
async function ensureNoAliceTokyoMembership(): Promise<void> {
  const result = await MembershipModel.deleteOne({
    userId: new mongoose.Types.ObjectId(ALICE_ID),
    tenantId: new mongoose.Types.ObjectId(TOKYO_TENANT_ID),
  });

  if (result.deletedCount > 0) {
    console.log("✓ Removed unexpected Alice → Tokyo membership");
  } else {
    console.log("✓ Alice has no Tokyo membership");
  }
}

/**
 * Prepare all persistent data required by this integration test.
 *
 * We intentionally do this before Test 1.
 */
async function ensureTestData(): Promise<void> {
  console.log("\n========================================");
  console.log(" Preparing Tenant Switch Test Data");
  console.log("========================================");

  /*
   * Users
   */

  await ensureUser(
    ALICE_ID,
    "alice@example.com",
    "Alice"
  );

  await ensureUser(
    YUKI_ID,
    "yuki@example.com",
    "Yuki"
  );

  /*
   * Tenants
   *
   * Kyoto may already be a real seeded tenant.
   * We never overwrite it.
   *
   * Tokyo is the synthetic tenant used by Test 7.
   */

  await ensureTenant(
    KYOTO_TENANT_ID,
    "Kyoto Stays",
    "kyoto-stays",
    ALICE_ID
  );

  await ensureTenant(
    TOKYO_TENANT_ID,
    "Tokyo Stays",
    "tokyo-stays",
    ALICE_ID
  );

  /*
   * Memberships
   */

  await ensureMembership(
    ALICE_ID,
    KYOTO_TENANT_ID,
    MembershipRole.HOST
  );

  await ensureMembership(
    YUKI_ID,
    KYOTO_TENANT_ID,
    MembershipRole.OWNER
  );

  /*
   * Security fixture:
   *
   * Alice MUST NOT belong to Tokyo.
   */

  await ensureNoAliceTokyoMembership();

  console.log("\n✓ Test data ready");
}

/*
 * ------------------------------------------------------------
 * Main
 * ------------------------------------------------------------
 */

async function main() {
  console.log("========================================");
  console.log(" Tenant Switch Test");
  console.log("========================================");

  await connectMongo(MONGO_URI);

  registerAuthDependencies(container);

  console.log("MongoDB connected");
  console.log("MongoDB database =", mongoose.connection.name);

  /*
   * ----------------------------------------------------------
   * Prepare deterministic test data
   * ----------------------------------------------------------
   */

  await ensureTestData();

  /*
   * ----------------------------------------------------------
   * Repositories
   * ----------------------------------------------------------
   */

  const tenantRepo = new TenantRepository(TenantModel);

  const membershipRepo = new MembershipRepository(MembershipModel);

  /*
   * SessionService is resolved from DI.
   *
   * SwitchTenantUseCase is responsible for:
   *
   *   sessionPort.updateActiveTenant(...)
   *
   * We do NOT manually update SessionModel during the switch.
   */

  const sessionService = container.resolve<any>(
    TOKENS_AUTH.ports.sessionPort
  );

  /*
   * ----------------------------------------------------------
   * SwitchTenantUseCase
   * ----------------------------------------------------------
   */

  const switchUseCase = new SwitchTenantUseCase(
    membershipRepo,
    tenantRepo as any,
    sessionService
  );

  /*
   * ----------------------------------------------------------
   * Test sessions
   * ----------------------------------------------------------
   */

  const aliceSessionId = uuidv4();
  const yukiSessionId = uuidv4();

  /*
   * Track sessions for guaranteed cleanup.
   */

  const testSessionIds = [
    aliceSessionId,
    yukiSessionId,
  ];

  try {
    /*
     * --------------------------------------------------------
     * Cleanup old test sessions if necessary
     * --------------------------------------------------------
     */

    await SessionModel.deleteMany({
      id: {
        $in: testSessionIds,
      },
    });

    /*
     * --------------------------------------------------------
     * Create Alice test session
     * --------------------------------------------------------
     */

    await SessionModel.create({
      id: aliceSessionId,
      userId: ALICE_ID,
      familyId: "tenant-switch-test-alice",
      deviceId: "tenant-switch-test-device-alice",
      userAgentHash: "tenant-switch-test-user-agent-alice",
      ipHash: "tenant-switch-test-ip-alice",
      refreshTokenId: "tenant-switch-test-refresh-alice",
      status: "ACTIVE",
      revoked: false,
      activeTenantId: null,
    });

    /*
     * --------------------------------------------------------
     * Test 1: Verify Alice exists
     * --------------------------------------------------------
     */

    console.log("\nTest 1: Verify Alice");

    const alice = await UserModel.findById(ALICE_ID).lean();

    if (!alice) {
      throw new Error(`Alice not found: ${ALICE_ID}`);
    }

    console.log("✓ Alice exists");

    /*
     * --------------------------------------------------------
     * Test 2: Verify Alice's Kyoto membership
     * --------------------------------------------------------
     */

    console.log("\nTest 2: Verify Alice membership — Kyoto Stays");

    const membership = await MembershipModel.findOne({
      userId: ALICE_ID,
      tenantId: KYOTO_TENANT_ID,
    }).lean();

    if (!membership) {
      throw new Error(
        `Alice does not have membership for Kyoto Stays: ${KYOTO_TENANT_ID}`
      );
    }

    if (membership.status !== "ACTIVE") {
      throw new Error(
        `Alice Kyoto membership is not ACTIVE: ${membership.status}`
      );
    }

    console.log(
      "✓ Alice has Kyoto Stays membership:",
      membership.role
    );

    /*
     * --------------------------------------------------------
     * Test 3: Verify Alice does NOT have Tokyo membership
     * --------------------------------------------------------
     */

    console.log("\nTest 3: Verify Alice cannot switch to Tokyo Stays");

    const noTokyoMembership = await MembershipModel.findOne({
      userId: ALICE_ID,
      tenantId: TOKYO_TENANT_ID,
    }).lean();

    if (noTokyoMembership) {
      throw new Error(
        "Test setup invalid: Alice unexpectedly has Tokyo Stays membership"
      );
    }

    console.log("✓ Alice has no Tokyo Stays membership");

    /*
     * --------------------------------------------------------
     * Test 4: switchTenant — valid tenant
     * --------------------------------------------------------
     */

    console.log("\nTest 4: switchTenant — valid tenant (Kyoto Stays)");

    const result = await switchUseCase.execute({
      userId: ALICE_ID,
      tenantId: KYOTO_TENANT_ID,
      sessionId: aliceSessionId,
    });

    if (!result) {
      throw new Error("switchTenant returned no result");
    }

    if (!result.tenant) {
      throw new Error(
        "switchTenant result does not contain tenant"
      );
    }

    console.log("✓ Alice switched to Kyoto Stays");

    /*
     * --------------------------------------------------------
     * Test 5: Verify Session.activeTenantId
     * --------------------------------------------------------
     */

    console.log("\nTest 5: Session activeTenantId update");

    const session = await SessionModel.findOne({
      id: aliceSessionId,
    }).lean();

    if (!session) {
      throw new Error("Alice session was not found");
    }

    if (session.activeTenantId !== KYOTO_TENANT_ID) {
      throw new Error(
        `Session activeTenantId mismatch. Expected ${KYOTO_TENANT_ID}, got ${session.activeTenantId}`
      );
    }

    console.log(
      "✓ Session.activeTenantId =",
      session.activeTenantId
    );

    /*
     * --------------------------------------------------------
     * Test 6: Gateway-style session lookup
     * --------------------------------------------------------
     */

    console.log(
      "\nTest 6: Gateway reads activeTenantId from Session"
    );

    const lookupSession = await SessionModel.findOne({
      id: aliceSessionId,
    }).lean();

    if (!lookupSession) {
      throw new Error("Session not found by ID");
    }

    if (lookupSession.activeTenantId !== KYOTO_TENANT_ID) {
      throw new Error(
        `Gateway session activeTenantId mismatch. Expected ${KYOTO_TENANT_ID}, got ${lookupSession.activeTenantId}`
      );
    }

    console.log("✓ Gateway can read activeTenantId");

    /*
     * --------------------------------------------------------
     * Test 7: switchTenant — unauthorized tenant
     * --------------------------------------------------------
     *
     * IMPORTANT:
     *
     * Tokyo tenant EXISTS.
     *
     * Alice has NO Tokyo membership.
     *
     * Therefore this test specifically verifies tenant-scope
     * authorization rather than testing whether the tenant exists.
     * --------------------------------------------------------
     */

    console.log(
      "\nTest 7: switchTenant — unauthorized Tokyo tenant"
    );

    let unauthorizedSwitchFailed = false;

    try {
      await switchUseCase.execute({
        userId: ALICE_ID,
        tenantId: TOKYO_TENANT_ID,
        sessionId: aliceSessionId,
      });
    } catch (error) {
      unauthorizedSwitchFailed = true;

      console.log(
        "✓ Unauthorized switch rejected:",
        error instanceof Error ? error.message : error
      );
    }

    if (!unauthorizedSwitchFailed) {
      throw new Error(
        "Security failure: Alice was able to switch to Tokyo Stays without membership"
      );
    }

    /*
     * --------------------------------------------------------
     * Test 8: switchTenant — nonexistent tenant
     * --------------------------------------------------------
     */

    console.log("\nTest 8: switchTenant — nonexistent tenant");

    let nonexistentTenantFailed = false;

    try {
      await switchUseCase.execute({
        userId: ALICE_ID,
        tenantId: "nonexistent",
        sessionId: aliceSessionId,
      });
    } catch (error) {
      nonexistentTenantFailed = true;

      console.log(
        "✓ Nonexistent tenant rejected:",
        error instanceof Error ? error.message : error
      );
    }

    if (!nonexistentTenantFailed) {
      throw new Error(
        "Security failure: nonexistent tenant was accepted"
      );
    }

    /*
     * --------------------------------------------------------
     * Test 9: Another user can switch to Kyoto Stays
     * --------------------------------------------------------
     */

    console.log(
      "\nTest 9: Another user can switch to Kyoto Stays"
    );

    const yuki = await UserModel.findById(YUKI_ID).lean();

    if (!yuki) {
      throw new Error(`Yuki not found: ${YUKI_ID}`);
    }

    await SessionModel.create({
      id: yukiSessionId,
      userId: YUKI_ID,
      familyId: "tenant-switch-test-yuki",
      deviceId: "tenant-switch-test-device-yuki",
      userAgentHash: "tenant-switch-test-user-agent-yuki",
      ipHash: "tenant-switch-test-ip-yuki",
      refreshTokenId: "tenant-switch-test-refresh-yuki",
      status: "ACTIVE",
      revoked: false,
      activeTenantId: null,
    });

    const yukiResult = await switchUseCase.execute({
      userId: YUKI_ID,
      tenantId: KYOTO_TENANT_ID,
      sessionId: yukiSessionId,
    });

    if (!yukiResult) {
      throw new Error(
        "Yuki switchTenant returned no result"
      );
    }

    if (!yukiResult.tenant) {
      throw new Error(
        "Yuki switchTenant result does not contain tenant"
      );
    }

    console.log("✓ Yuki can switch to Kyoto Stays");

    /*
     * --------------------------------------------------------
     * Test 10: Verify Yuki Session
     * --------------------------------------------------------
     */

    console.log(
      "\nTest 10: Verify Yuki Session.activeTenantId"
    );

    const yukiSession = await SessionModel.findOne({
      id: yukiSessionId,
    }).lean();

    if (!yukiSession) {
      throw new Error("Yuki session was not found");
    }

    if (yukiSession.activeTenantId !== KYOTO_TENANT_ID) {
      throw new Error(
        `Yuki session activeTenantId mismatch. Expected ${KYOTO_TENANT_ID}, got ${yukiSession.activeTenantId}`
      );
    }

    console.log(
      "✓ Yuki Session.activeTenantId =",
      yukiSession.activeTenantId
    );

    /*
     * --------------------------------------------------------
     * Finished
     * --------------------------------------------------------
     */

    console.log("\n========================================");
    console.log(" ALL TENANT SWITCH TESTS PASSED");
    console.log("========================================");
  } finally {
    /*
     * --------------------------------------------------------
     * Guaranteed cleanup
     * --------------------------------------------------------
     *
     * Even when Test 1–10 fails, test sessions are removed.
     *
     * We intentionally DO NOT delete:
     *
     *   - users
     *   - tenants
     *   - memberships
     *
     * because those are deterministic test fixtures.
     * --------------------------------------------------------
     */

    console.log("\nCleaning up test sessions...");

    await SessionModel.deleteMany({
      id: {
        $in: testSessionIds,
      },
    });

    console.log("✓ Test sessions deleted");
  }
}

main()
  .catch((error) => {
    console.error("\n========================================");
    console.error(" TENANT SWITCH TEST FAILED");
    console.error("========================================");

    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });