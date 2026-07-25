import { spawn, ChildProcess } from "child_process";
import http from "http";

// ── Service definitions ──────────────────────────────────────────────
const services = [
  { name: "auth", port: 4010, file: "src/subgraphs/auth/index.ts" },
  { name: "user", port: 4020, file: "src/subgraphs/user/index.ts" },
  { name: "booking", port: 4030, file: "src/subgraphs/booking/index.ts" },
  { name: "review", port: 4040, file: "src/subgraphs/review/index.ts" },
  { name: "payment", port: 4050, file: "src/subgraphs/payment/index.ts" },
  { name: "tenant", port: 4060, file: "src/subgraphs/tenant/index.ts" },
  { name: "audit", port: 4070, file: "src/subgraphs/audit/index.ts" },
  { name: "location", port: 4080, file: "src/subgraphs/location/index.ts" },
  { name: "amenity", port: 4090, file: "src/subgraphs/amenity/index.ts" },
  { name: "listing", port: 4101, file: "src/subgraphs/listing/index.ts" },
  { name: "account", port: 4102, file: "src/subgraphs/account/index.ts" },
  { name: "cart", port: 4103, file: "src/subgraphs/cart/index.ts" },
  { name: "admin", port: 4104, file: "src/subgraphs/admin/index.ts" },
  { name: "wisdom", port: 4200, file: "src/wisdom/index.ts" },
  { name: "voice", port: 4300, file: "src/voice/index.ts" },
];

// ── State ────────────────────────────────────────────────────────────
const children: Map<string, ChildProcess> = new Map();
const restarted: Map<string, number> = new Map();

// ── Helpers ──────────────────────────────────────────────────────────
function startService(svc: (typeof services)[number]) {
  const child = spawn("npx", ["tsx", svc.file], {
    stdio: "inherit",
    env: process.env,
  });

  children.set(svc.name, child);
  console.log(`🚀 [${svc.name}] started (pid ${child.pid})`);

  child.on("exit", (code, signal) => {
    children.delete(svc.name);

    if (signal === "SIGTERM" || signal === "SIGKILL") return;

    const count = (restarted.get(svc.name) || 0) + 1;
    restarted.set(svc.name, count);

    if (count <= 5) {
      console.log(`⚠️  [${svc.name}] crashed (exit ${code}), restarting (attempt ${count})...`);
      setTimeout(() => startService(svc), 2000);
    } else {
      console.error(`❌ [${svc.name}] crashed too many times, giving up`);
    }
  });
}

function waitForService(name: string, port: number, timeoutMs = 120_000): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;

    const poll = () => {
      if (Date.now() > deadline) {
        reject(new Error(`${name} at port ${port} not ready after ${timeoutMs / 1000}s`));
        return;
      }

      const body = JSON.stringify({ query: "{ _service { sdl } }" });
      const req = http.request(
        { hostname: "127.0.0.1", port, path: "/graphql", method: "POST",
          headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
          timeout: 3000 },
        (res) => {
          if (res.statusCode && res.statusCode < 500) {
            console.log(`✅ ${name} ready`);
            resolve();
          } else {
            retry();
          }
        }
      );

      req.on("error", retry);
      req.on("timeout", () => { req.destroy(); retry(); });
      req.write(body);
      req.end();
    };

    const retry = () => setTimeout(poll, 2000);
    poll();
  });
}

// ── Main ─────────────────────────────────────────────────────────────
async function main() {
  // Immediate health server so Railway healthcheck passes while subgraphs boot
  const PORT = parseInt(process.env.PORT || "4000", 10);
  const healthServer = http.createServer((_req, res) => {
    if (_req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", phase: "booting" }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise<void>((resolve) => healthServer.listen(PORT, resolve));
  console.log(`🏥 Health server on :${PORT} (temporary)`);

  // Start all subgraphs
  console.log("Starting all subgraphs...");
  for (const svc of services) {
    startService(svc);
  }

  // Wait for subgraphs to bind ports
  await new Promise((r) => setTimeout(r, 3000));

  console.log("Waiting for all subgraphs to be ready...");

  const results = await Promise.allSettled(
    services.map((svc) => waitForService(svc.name, svc.port))
  );

  const failed = results
    .map((r, i) => (r.status === "rejected" ? services[i].name : null))
    .filter(Boolean);

  if (failed.length > 0) {
    console.error(`❌ Subgraphs not ready: ${failed.join(", ")}`);
    console.log("Starting gateway anyway (some subgraphs may be unavailable)...");
  } else {
    console.log("🎉 All subgraphs ready!");
  }

  // Close health server so gateway can bind to the same port
  await new Promise<void>((resolve) => healthServer.close(() => resolve()));
  console.log("🏥 Health server closed, starting gateway...");

  // Start gateway
  const gateway = spawn("npx", ["tsx", "src/gateway/index.ts"], {
    stdio: "inherit",
    env: process.env,
  });

  gateway.on("exit", (code) => {
    console.error(`Gateway exited with code ${code}`);
    process.exit(code ?? 1);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log("Shutting down...");
    gateway.kill("SIGTERM");
    for (const [name, child] of children) {
      console.log(`Stopping ${name}...`);
      child.kill("SIGTERM");
    }
    setTimeout(() => process.exit(0), 5000);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main();
