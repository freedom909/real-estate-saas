// scripts/start-backend.cjs
//
// Production launcher: spawns every subgraph + the Apollo Federation Gateway
// as child processes. If any child exits unexpectedly we restart it once;
// repeated failures within 60s will abort the process so the supervisor
// (Docker / systemd / Cloudflare Tunnel) can surface the error.
//
// This file intentionally uses CommonJS so it runs with plain `node` even
// if the rest of the repo is "type": "module".

const { spawn } = require("child_process");

const isWin = process.platform === "win32";
const npmBin = isWin ? "npm.cmd" : "npm";

const services = [
  { name: "audit",    port: 4070, script: "dev:audit" },
  { name: "user",     port: 4020, script: "dev:user" },
  { name: "tenant",   port: 4060, script: "dev:tenant" },
  { name: "location", port: 4080, script: "dev:location" },
  { name: "amenity",  port: 4090, script: "dev:amenity" },
  { name: "listing",  port: 4101, script: "dev:listing" },
  { name: "admin",    port: 4104, script: "dev:admin" },
  { name: "auth",     port: 4010, script: "dev:auth" },
  { name: "account",  port: 4102, script: "dev:account" },
  { name: "review",   port: 4040, script: "dev:review" },
  { name: "ai",       port: 4200, script: "dev:ai" },
  { name: "voice",    port: 4300, script: "dev:voice" },
  { name: "cart",     port: 4103, script: "dev:cart" },
  { name: "booking",  port: 4030, script: "dev:booking" },
  { name: "payment",  port: 4050, script: "dev:payment" },
  { name: "calendar", port: 4100, script: "dev:calendar" },
];

const gatewayScript = "dev:gateway"; // listens on 4000

const failures = new Map(); // script -> array of crash timestamps
const CRASH_WINDOW_MS = 60_000;
const MAX_CRASHES_IN_WINDOW = 3;

function log(service, line) {
  const ts = new Date().toISOString();
  const prefixed = line
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => `[${ts}] [${service.padEnd(8)}] ${l}`)
    .join("\n");
  if (prefixed) process.stdout.write(prefixed + "\n");
}

function start(script, serviceName) {
  log(serviceName, `starting (${npmBin} run ${script})…`);
  const child = spawn(npmBin, ["run", script], {
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  });
  child.stdout.on("data", (d) => log(serviceName, d.toString()));
  child.stderr.on("data", (d) => log(serviceName, d.toString()));

  child.on("exit", (code, signal) => {
    const now = Date.now();
    const arr = failures.get(script) ?? [];
    arr.push(now);
    const recent = arr.filter((t) => now - t <= CRASH_WINDOW_MS);
    failures.set(script, recent);

    log(
      serviceName,
      `EXIT code=${code ?? "null"} signal=${signal ?? "null"} | recent-crashes=${recent.length}/${MAX_CRASHES_IN_WINDOW}`
    );

    if (recent.length >= MAX_CRASHES_IN_WINDOW) {
      console.error(
        `\n❌ [FATAL] ${serviceName} (${script}) crashed ${recent.length}x in ${CRASH_WINDOW_MS / 1000}s. Aborting process group so orchestrators surface the failure.`
      );
      process.exit(1);
    } else {
      setTimeout(() => start(script, serviceName), 2_000);
    }
  });
}

// 1) Start all 16 subgraphs.
services.forEach((s) => start(s.script, s.name));

// 2) Give them 15s to bind ports, then start the Federation Gateway
//    (so IntrospectAndCompose doesn't spin forever on the first poll).
setTimeout(() => start(gatewayScript, "gateway"), 15_000);
