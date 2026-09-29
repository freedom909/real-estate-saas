import connectMongoDB from "./src/infrastructure/config/connectMongoDB";
import TenantModel from "./src/core/tenant/infrastructure/models/tenant.model";
import MembershipModel from "./src/core/tenant/infrastructure/models/membership.model";

await connectMongoDB();

const tenant = await TenantModel.findOne({
  slug: "kyoto-stays",
}).lean();

console.log("=== KYOTO TENANT ===");

if (!tenant) {
  console.log("Tenant not found");
} else {
  console.log({
    _id: tenant._id,
    name: tenant.name,
    slug: tenant.slug,
    ownerUserId: tenant.ownerUserId,
    status: tenant.status,
  });

  const membership = await MembershipModel.findOne({
    userId: "6abb7f9f421d9ceeee4a2d89",
    tenantId: tenant._id,
  }).lean();

  console.log("=== EXISTING MEMBERSHIP ===");
  console.log(membership);
}

process.exit(0);
