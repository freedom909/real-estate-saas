import express from "express";
import jwt from "jsonwebtoken";
import { mapLegacyRole } from "@/core/shared/domain/role";

const router = express.Router();

/**
 * Decode user from Authorization header (same as gateway auth plugin).
 */
function decodeUser(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const token = authHeader.replace("Bearer ", "");
    const decodedHeader = jwt.decode(token, { complete: true });
    const alg = decodedHeader?.header?.alg;

    const secret =
      alg === "RS256"
        ? process.env.JWT_PUBLIC_KEY || process.env.ACCESS_TOKEN_SECRET!
        : process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET!;

    const payload = jwt.verify(token, secret, {
      algorithms: alg === "RS256" ? ["RS256"] : ["HS256"],
    }) as any;

    return {
      userId: payload.sub,
      sessionId: payload.sessionId,
      role: payload.role ? mapLegacyRole(payload.role) : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * POST /api/tenants/switch
 *
 * Switches the active tenant for the authenticated user.
 * Body: { tenantId: string }
 * Response: { tenant: { id, name, slug, status }, activeTenantId: string }
 */
router.post("/switch", async (req, res) => {
  try {
    const user = decodeUser(req);
    if (!user?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { tenantId } = req.body;
    if (!tenantId) {
      return res.status(400).json({ error: "tenantId is required" });
    }

    // Dynamic imports to avoid circular dependencies at module load time
    const { default: mongoose } = await import("mongoose");
    const { SwitchTenantUseCase } = await import(
      "@/core/tenant/application/usecase/switch-tenant.use-case"
    );
    const { MembershipRepository } = await import(
      "@/core/tenant/infrastructure/repos/membership.repo"
    );
    const { TenantRepository } = await import(
      "@/core/tenant/infrastructure/repos/tenant.repository"
    );
    const { default: SessionModel } = await import(
      "@/subgraphs/auth/infrastructure/models/session.model"
    );

    // Get models from mongoose
    const MembershipModel = mongoose.model("Membership");
    const TenantModel = mongoose.model("Tenant");

    const membershipRepo = new MembershipRepository(MembershipModel);
    const tenantRepo = new TenantRepository(TenantModel as any);
    const switchUseCase = new SwitchTenantUseCase(membershipRepo, tenantRepo as any);

    // Execute switch
    const result = await switchUseCase.execute({
      userId: user.userId,
      tenantId,
    });

    // Update session with new active tenant
    if (user.sessionId) {
      await SessionModel.findOneAndUpdate(
        { id: user.sessionId },
        { activeTenantId: tenantId }
      );
    }

    return res.json({
      tenant: result.tenant,
      activeTenantId: result.activeTenantId,
    });
  } catch (err: any) {
    console.error("[Tenant Switch] Error:", err.message);

    if (
      err.message === "Tenant not found" ||
      err.message === "You do not have access to this tenant" ||
      err.message === "Tenant is not active"
    ) {
      return res.status(403).json({ error: err.message });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/tenants/available
 *
 * Returns all tenants the authenticated user has access to.
 * Response: { tenants: [{ id, name, slug, status }] }
 */
router.get("/available", async (req, res) => {
  try {
    const user = decodeUser(req);
    if (!user?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { default: mongoose } = await import("mongoose");
    const { default: MembershipModel } = await import(
      "@/subgraphs/user/models/membership.model"
    );
    const { TenantModel } = await import(
      "@/core/tenant/infrastructure/models/tenant.model"
    );

    // Find all memberships for this user
    const memberships = await MembershipModel.find({ userId: user.userId }).lean();

    if (memberships.length === 0) {
      return res.json({ tenants: [] });
    }

    // ownerId in Membership is the tenant's _id (as stored in seed data)
    // Convert ObjectId to string for matching against tenant._id
    const tenantIds = memberships.map((m: any) => m.ownerId.toString());

    // Fetch tenants by their IDs
    const tenants = await TenantModel.find({ _id: { $in: tenantIds } })
      .select("name slug status")
      .lean();

    return res.json({ tenants });
  } catch (err: any) {
    console.error("[Tenant Available] Error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/tenants/active
 *
 * Returns the currently active tenant for the authenticated user.
 * Response: { activeTenantId: string | null }
 */
router.get("/active", async (req, res) => {
  try {
    const user = decodeUser(req);
    if (!user?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!user.sessionId) {
      return res.json({ activeTenantId: null });
    }

    const { default: SessionModel } = await import(
      "@/subgraphs/auth/infrastructure/models/session.model"
    );

    const session = await SessionModel.findOne({ id: user.sessionId })
      .select("activeTenantId")
      .lean();

    return res.json({ activeTenantId: session?.activeTenantId || null });
  } catch (err: any) {
    console.error("[Tenant Active] Error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
