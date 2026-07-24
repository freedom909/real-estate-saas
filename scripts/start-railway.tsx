import { spawn } from "child_process";

const services = [
  { name: "auth", path: "src/subgraphs/auth/index.ts", port: 4010 },
  { name: "user", path: "src/subgraphs/user/index.ts", port: 4020 },
  { name: "booking", path: "src/subgraphs/booking/index.ts", port: 4030 },
  { name: "review", path: "src/subgraphs/review/index.ts", port: 4040 },
  { name: "payment", path: "src/subgraphs/payment/index.ts", port: 4050 },
  { name: "tenant", path: "src/subgraphs/tenant/index.ts", port: 4060 },
  { name: "audit", path: "src/subgraphs/audit/index.ts", port: 4070 },
  { name: "location", path: "src/subgraphs/location/index.ts", port: 4080 },
  { name: "amenity", path: "src/subgraphs/amenity/index.ts", port: 4090 },
  { name: "listing", path: "src/subgraphs/listing/index.ts", port: 4101 },
  { name: "account", path: "src/subgraphs/account/index.ts", port: 4102 },
  { name: "cart", path: "src/subgraphs/cart/index.ts", port: 4103 },
  { name: "admin", path: "src/subgraphs/admin/index.ts", port: 4104 },
  { name: "wisdom", path: "src/wisdom/index.ts", port: 4200 },
  { name: "voice", path: "src/voice/index.ts", port: 4300 },
];

console.log("🚀 Starting Railway monolith deployment...");

// Launch all subgraphs in background
for (const svc of services) {
  const child = spawn("npx", ["tsx", svc.path], {
    stdio: "inherit",
    shell: true,
  });
  child.on("error", (err) => {
    console.error(`❌ ${svc.name} failed to start:`, err.message);
  });
  child.on("exit", (code) => {
    if (code !== 0) {
      console.error(`⚠️ ${svc.name} exited with code ${code}`);
    }
  });
}

console.log("⏳ Waiting 15s for subgraphs to initialize...");
await new Promise((r) => setTimeout(r, 15000));

// Launch gateway on Railway's assigned PORT (foreground)
const gateway = spawn("npx", ["tsx", "src/gateway/index.ts"], {
  stdio: "inherit",
  shell: true,
});

gateway.on("error", (err) => {
  console.error("❌ Gateway failed to start:", err.message);
});

gateway.on("exit", (code) => {
  console.log(`Gateway exited with code ${code}`);
  process.exit(code ?? 1);
});
