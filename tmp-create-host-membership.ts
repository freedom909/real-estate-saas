import connectMongoDB from "./src/infrastructure/config/connectMongoDB";
import MembershipModel from "./src/core/tenant/infrastructure/models/membership.model";

await connectMongoDB();

const userId = "6abb7f9f421d9ceeee4a2d89";
const tenantId = "6650a0000000000000000001";

const membership = await MembershipModel.create({
  userId,
  tenantId,
  role: "HOST",
  status: "ACTIVE",
});

console.log("=== MEMBERSHIP CREATED ===");
console.log({
  id: membership._id,
  userId: membership.userId,
  tenantId: membership.tenantId,
  role: membership.role,
  status: membership.status,
});

process.exit(0);
