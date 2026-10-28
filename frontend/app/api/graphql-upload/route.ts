// frontend/app/api/graphql-upload/route.ts
//
// Upload proxy for GraphQL requests that may carry multipart file uploads.
//
// Why this exists:
// - Apollo Gateway doesn't forward multipart uploads to subgraphs, so the
//   upload client (lib/apolloClient.ts) must reach the listing subgraph
//   directly.
// - The listing subgraph (and every other subgraph) is guarded by
//   verifyInternalServiceRequest, which requires the internal
//   `x-service-token` header and rejects everything else with HTTP 403.
// - The internal token must never ship to the browser, so upload requests
//   are relayed through this same-origin route, which attaches the token
//   server-side before forwarding to the listing subgraph.
import { NextRequest, NextResponse } from "next/server";

const LISTING_SUBGRAPH_URL =
  process.env.LISTING_SUBGRAPH_URL ||
  process.env.NEXT_PUBLIC_LISTING_URL ||
  "http://localhost:4101/graphql";

export async function POST(req: NextRequest) {
  try {
    const serviceToken = process.env.INTERNAL_SERVICE_TOKEN;
    if (!serviceToken) {
      return NextResponse.json(
        { error: "Service authentication unavailable" },
        { status: 503 }
      );
    }

    const contentType = req.headers.get("content-type") ?? "";
    const isMultipart = contentType
      .toLowerCase()
      .startsWith("multipart/form-data");

    // Multipart: re-send via FormData (fetch sets the boundary header itself).
    // Otherwise (plain GraphQL JSON): pass the body through verbatim.
    const body = isMultipart ? await req.formData() : await req.text();

    const headers: Record<string, string> = {
      "x-service-token": serviceToken,
    };

    // Forward the logged-in user so the subgraph can build its context.
    const authorization = req.headers.get("authorization");
    if (authorization) {
      headers.authorization = authorization;
    }

    // Resolve the caller's active tenant (Session.activeTenantId — the same
    // source of truth the gateway's auth plugin uses) and forward it as
    // x-tenant-id. getUserFromContext derives context.user.tenantId EXCLUSIVELY
    // from that header, and tenant-scoped mutations (e.g. createListing) require it.
    if (authorization) {
      try {
        const tenantRes = await fetch(
          `${process.env.GATEWAY_URL ?? "http://localhost:4000"}/api/tenants/active`,
          { headers: { authorization }, cache: "no-store" }
        );
        if (tenantRes.ok) {
          const { activeTenantId } = (await tenantRes.json()) as {
            activeTenantId?: string | null;
          };
          if (activeTenantId) headers["x-tenant-id"] = activeTenantId;
        }
      } catch (e) {
        console.warn("[graphql-upload] active-tenant lookup failed:", e);
      }
    }

    const apolloPreflight = req.headers.get("apollo-require-preflight");
    if (apolloPreflight) {
      headers["apollo-require-preflight"] = apolloPreflight;
    }

    if (!isMultipart && contentType) {
      headers["content-type"] = contentType;
    }

    const upstream = await fetch(LISTING_SUBGRAPH_URL, {
      method: "POST",
      headers,
      body,
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err: any) {
    console.error("[graphql-upload proxy] upstream error:", err);
    return NextResponse.json(
      { error: err?.message || "Upload proxy failed" },
      { status: 502 }
    );
  }
}
