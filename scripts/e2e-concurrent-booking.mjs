// scripts/e2e-concurrent-booking.mjs
//
// End-to-end concurrency test: two DIFFERENT customer tokens try to book the
// SAME listing for the SAME dates at the SAME time through the GraphQL gateway.
// Expected: exactly ONE succeeds, the other gets "already occupied".
//
// Verifies the real production path:
//   gateway (:4000) auth plugin → booking subgraph → CreateBookingUseCase
//   → calendar subgraph ReserveSlotUseCase (CAS + unique index guard)
//
// Usage:
//   node scripts/e2e-concurrent-booking.mjs                 # picks first listing
//   node scripts/e2e-concurrent-booking.mjs <listingId>      # specific listing
//
// Env: GATEWAY_URL, ACCESS_TOKEN_SECRET, MONGO_URI (all from .env), plus
// optional E2E_CHECK_IN / E2E_CHECK_OUT (YYYY-MM-DD, default ~60 days out).

import "dotenv/config";
import dns from "dns";
// Node's default DNS resolver may refuse MongoDB Atlas SRV lookups on some
// networks — use public resolvers (same trick as the services see in prod).
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import mysql from "mysql2/promise";
import mongoose from "mongoose";

const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:4000";
const SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
if (!SECRET) throw new Error("ACCESS_TOKEN_SECRET not set");

// ── 1. Pick a listing + its price from MySQL (listings live there) ──────────
const db = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

let listingId = process.argv[2];
let listingRow;
if (listingId) {
  const [rows] = await db.query("SELECT id, title, pricePerNight FROM listings WHERE id = ?", [listingId]);
  listingRow = rows[0];
} else {
  const [rows] = await db.query("SELECT id, title, pricePerNight FROM listings ORDER BY createdAt DESC LIMIT 1");
  listingRow = rows[0];
}
if (!listingRow) throw new Error("No listing found — run npm run seed:listings first");
listingId = listingRow.id;
console.log(`[e2e] listing: ${listingId} "${listingRow.title}" price=${listingRow.pricePerNight}`);
// mysql2 returns DECIMAL columns as strings — coerce for the Float scalar
listingRow.pricePerNight = Number(listingRow.pricePerNight);

// ── 2. Dates: two nights, far enough out to be free ─────────────────────────
const checkIn = process.env.E2E_CHECK_IN || new Date(Date.now() + 60 * 864e5).toISOString().slice(0, 10);
const checkOut = process.env.E2E_CHECK_OUT || new Date(Date.now() + 62 * 864e5).toISOString().slice(0, 10);
console.log(`[e2e] dates: ${checkIn} → ${checkOut}`);

// ── 3. Two customer identities: real Session docs + JWTs (same shape the
//      auth service issues in SessionService.createSession) ─────────────────
await mongoose.connect(process.env.MONGO_URI);
const SessionModel =
  mongoose.models.Session ||
  mongoose.model(
    "Session",
    new mongoose.Schema(
      {
        id: String, userId: String, familyId: String, deviceId: String,
        userAgentHash: String, ipHash: String, refreshTokenId: String,
        revoked: { type: Boolean, default: false }, revokedAt: Date, lastSeenAt: Date,
        expiresAt: Date, status: { type: String, default: "ACTIVE" },
        activeTenantId: { type: String, default: null },
      },
      { timestamps: true }
    )
  );

async function mintCustomer(n) {
  const userId = `e2e-customer-${n}-${randomUUID().slice(0, 8)}`;
  const sessionId = randomUUID();
  await SessionModel.create({
    id: sessionId,
    userId,
    familyId: randomUUID(),
    deviceId: "e2e-script",
    refreshTokenId: randomUUID(),
    expiresAt: new Date(Date.now() + 7 * 864e5),
    status: "ACTIVE",
    activeTenantId: null,
  });
  const token = jwt.sign(
    { sub: userId, sessionId, type: "access", role: "CUSTOMER", email: `${userId}@e2e.test` },
    SECRET,
    { expiresIn: "1h" }
  );
  return { userId, sessionId, token };
}

const [alice, bob] = await Promise.all([mintCustomer("alice"), mintCustomer("bob")]);
console.log(`[e2e] customers: ${alice.userId} vs ${bob.userId}`);

// ── 4. Fire both createBooking mutations CONCURRENTLY through the gateway ───
const MUTATION = `mutation createBooking($input: CreateBookingInput!) {
  createBooking(input: $input) { code success message booking { id } }
}`;

function book(customer) {
  return fetch(`${GATEWAY_URL}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${customer.token}`,
    },
    body: JSON.stringify({
      operationName: "createBooking",
      query: MUTATION,
      variables: {
        input: {
          listingId,
          checkInDate: new Date(checkIn).toISOString(),
          checkOutDate: new Date(checkOut).toISOString(),
          price: listingRow.pricePerNight,
        },
      },
    }),
  }).then(async (r) => ({ customer, status: r.status, body: await r.json() }));
}

console.log(`[e2e] firing both bookings concurrently ...`);
const [ra, rb] = await Promise.all([book(alice), book(bob)]);

function outcome(r) {
  const d = r.body?.data?.createBooking;
  const errs = r.body?.errors?.map((e) => e.message).join("; ");
  return {
    customer: r.customer.userId,
    http: r.status,
    success: d?.success ?? false,
    message: d?.message ?? errs ?? JSON.stringify(r.body).slice(0, 300),
  };
}
const oa = outcome(ra);
const ob = outcome(rb);
console.log("[e2e] result A:", JSON.stringify(oa));
console.log("[e2e] result B:", JSON.stringify(ob));

// ── 5. Assert: exactly one success ─────────────────────────────────────────
const wins = [oa, ob].filter((o) => o.success);
const ok = wins.length === 1;
console.log(ok ? "✅ PASS: exactly one booking succeeded" : `❌ FAIL: expected exactly 1 success, got ${wins.length}`);

// ── 5b. Sequential probe: a THIRD customer must NOT be able to re-book the
//      same dates after the winner's booking (taken dates stay taken) ──────
const carol = await mintCustomer("carol");
const rc = await book(carol);
const oc = outcome(rc);
console.log("[e2e] re-booking probe (carol):", JSON.stringify(oc));
const probeOk = !oc.success;
console.log(probeOk ? "✅ probe: taken dates correctly rejected a third customer" : "❌ probe: third customer could re-book occupied dates!");

// ── 6. Evidence: calendar_slots rows for these dates ───────────────────────
const [slots] = await db.query(
  "SELECT date, status, bookingId FROM calendar_slots WHERE listingId = ? AND date >= ? AND date <= ? ORDER BY date",
  [listingId, checkIn, checkOut]
);
console.log("[e2e] calendar_slots:");
for (const s of slots) console.log(`   ${s.date} | ${s.status} | booking=${s.bookingId ?? "-"}`);

// ── 7. Cleanup: release anything this test reserved (leave DB as found) ────
if (wins.length > 0) {
  const winnerBookingIds = new Set(slots.map((s) => s.bookingId).filter(Boolean));
  await db.query(
    "UPDATE calendar_slots SET status='AVAILABLE', bookingId=NULL, blockedBy=NULL WHERE listingId = ? AND date >= ? AND date <= ?",
    [listingId, checkIn, checkOut]
  );
  if (winnerBookingIds.size > 0) {
    await db.query("UPDATE bookings SET status='CANCELLED' WHERE id IN (?)", [[...winnerBookingIds]]).catch(() => {});
  }
  console.log("[e2e] cleaned up: test slots released");
}

await mongoose.disconnect();
await db.end();
process.exit(ok && probeOk ? 0 : 1);
