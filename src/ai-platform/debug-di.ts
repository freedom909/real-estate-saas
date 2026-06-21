// src/ai-platform/debug-di.ts
// Run with: npx tsx src/ai-platform/debug-di.ts
import "reflect-metadata";
import { container } from "tsyringe";

import AIPlatformDependencies from "./container/registers/ai-platform.register";
import registerAuditDependencies from "@/modules/container/audit.register";
import { cacheContainer } from "@/modules/container/cache.register";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { TOKENS_AGENT } from "@/ai-platform/container/agents/agent.token";
import { TOKENS_ORCHESTRATOR } from "@/ai-platform/container/context/orchestrator/orchestrator";
import { TOKENS_EXTRACTOR } from "@/ai-platform/container/semantic/extractor";
import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";
import { TOKENS_EVENT_BUS } from "@/modules/tokens/event.bus.token";
import { TOKENS_AGENT_FACTORY } from "@/ai-platform/container/agents/factory.token";
import { CreateBookingUseCase } from "@/core/booking/application/usecases/create-booking.usecase";
import { BookingAgent } from "@/ai-platform/domain/agents/booking/booking.agent";
import { AgentFactory } from "@/ai-platform/domain/agents/agent.factory";
import { AgentRouterService } from "@/ai-platform/domain/orchestration/router/agentRouter.service";

console.log("=== Step 1: Registering dependencies ===");
try {
  registerAuditDependencies(container);
  console.log("✅ Audit registered");
} catch (e: any) {
  console.error("❌ Audit registration failed:", e.message);
}

try {
  cacheContainer();
  console.log("✅ Cache registered");
} catch (e: any) {
  console.error("❌ Cache registration failed:", e.message);
}

try {
  AIPlatformDependencies();
  console.log("✅ AI Platform registered");
} catch (e: any) {
  console.error("❌ AI Platform registration failed:", e.message);
}

console.log("\n=== Step 2: Resolving dependencies by token ===");
const tests: [string, symbol][] = [
  ["BookingRepository", TOKENS_BOOKING.repository.bookingRepository],
  ["EventBus", TOKENS_EVENT_BUS.eventBus],
  ["BookingAgent", TOKENS_AGENT.bookingAgent],
  ["AgentFactory", TOKENS_AGENT_FACTORY.agentFactory],
  ["AgentRouterService", TOKENS_ORCHESTRATOR.agentRouterService],
  ["SemanticExtractor", TOKENS_EXTRACTOR.semanticExtractor],
  ["ChatUseCase", TOKENS_AI.usecase.chatUseCase],
  ["AIPlatformOrchestrator", TOKENS_ORCHESTRATOR.aiPlatformOrchestrator],
];

for (const [name, token] of tests) {
  try {
    const instance = container.resolve(token);
    console.log(`✅ ${name}: resolved OK`);
  } catch (e: any) {
    console.error(`❌ ${name}: ${e.message}`);
  }
}

console.log("\n=== Step 3: Resolve by class ===");
try {
  const createBooking = container.resolve(CreateBookingUseCase);
  console.log("✅ CreateBookingUseCase (by class): resolved OK");
} catch (e: any) {
  console.error(`❌ CreateBookingUseCase (by class): ${e.message}`);
}

try {
  const agent = container.resolve(BookingAgent);
  console.log("✅ BookingAgent (by class): resolved OK");
} catch (e: any) {
  console.error(`❌ BookingAgent (by class): ${e.message}`);
}

try {
  const factory = container.resolve(AgentFactory);
  console.log("✅ AgentFactory (by class): resolved OK");
} catch (e: any) {
  console.error(`❌ AgentFactory (by class): ${e.message}`);
}

try {
  const router = container.resolve(AgentRouterService);
  console.log("✅ AgentRouterService (by class): resolved OK");
} catch (e: any) {
  console.error(`❌ AgentRouterService (by class): ${e.message}`);
}

console.log("\n=== Done ===");
