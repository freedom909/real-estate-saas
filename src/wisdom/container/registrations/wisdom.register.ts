// src/wisdom/container/registrations/wisdom.register.ts

import { container } from "tsyringe";
import { WISDOM_TOKENS } from "../tokens/wisdom.tokens";

// Infrastructure
import { OpenAITool } from "@/wisdom/tools/openai.tool";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";

// Semantic
import { SemanticExtractor } from "../../semantic/semantic-extractor";
import { RuleExtractor } from "../../semantic/extractors/rule.extractor";
import { MessageRuleExtractor } from "../../semantic/extractors/message-rule.extractor";
import { LLMExtractor } from "../../semantic/extractors/llm.extractor";

// Reference
import { ReferenceResolver } from "../../reference/reference-resolver";

// Routing
import { AgentRouter } from "../../agents/agent-router";

// Agents
import { ListingAgent } from "../../agents/listing/listing.agent";
import { BookingAgent } from "../../agents/booking/booking.agent";
import { GeneralAgent } from "../../agents/general.agent";

// Memory
import { BookingStateUpdater } from "../../memory/booking-state-updater";
import { KnowledgeExtractor } from "../../memory/extractor/knowledge.extractor";
import { KnowledgeStore } from "../../memory/knowledge.store";

// Orchestration
import { WisdomOrchestrator } from "../../orchestration/wisdom-orchestrator";

// Application
import { ChatUseCase } from "../../application/usecases/chat.use-case";
import { MemoryStore } from "@/wisdom/memory/memory.store";
import { MemoryManager } from "@/wisdom/memory/memoryManager";
import { LongTermStore } from "@/wisdom/memory/infra/long-term/long-term.store";

export function registerWisdom() {
  // Infrastructure — OpenAI adapter (used by LLMExtractor and as LLM provider)
  container.register(TOKENS_AI.OpenAITool, { useClass: OpenAITool });
  container.register(TOKENS_AI.usecase.llmProvider, { useClass: OpenAITool });
  console.log("  ✅ OpenAITool registered");

  // Extractors
  container.register(WISDOM_TOKENS.extractors.ruleExtractor, { useClass: RuleExtractor });
  container.register(WISDOM_TOKENS.extractors.messageRuleExtractor, { useClass: MessageRuleExtractor });
  container.register(WISDOM_TOKENS.extractors.llmExtractor, { useClass: LLMExtractor });

  // Semantic
  container.register(WISDOM_TOKENS.semanticExtractor, { useClass: SemanticExtractor });

  // Reference
  container.register(WISDOM_TOKENS.referenceResolver, { useClass: ReferenceResolver });

  // Routing
  container.register(WISDOM_TOKENS.router, { useClass: AgentRouter });

  // Agents
  container.register(WISDOM_TOKENS.agents.listingAgent, { useClass: ListingAgent });
  container.register(WISDOM_TOKENS.agents.bookingAgent, { useClass: BookingAgent });
  container.register(WISDOM_TOKENS.agents.generalAgent, { useClass: GeneralAgent });

  // Memory
  container.register(WISDOM_TOKENS.memory.bookingStateUpdater, { useClass: BookingStateUpdater });
  container.register(WISDOM_TOKENS.memory.memoryStore, { useClass: MemoryStore });
  container.register(WISDOM_TOKENS.memory.memoryManager, { useClass: MemoryManager });
  container.register(WISDOM_TOKENS.memory.knowledgeExtractor, { useClass: KnowledgeExtractor });
  container.register(WISDOM_TOKENS.memory.knowledgeStore, { useClass: KnowledgeStore });
  container.register(WISDOM_TOKENS.memory.longTermStore, { useClass: LongTermStore });
  // container.register(WISDOM_TOKENS.memory.sessionMemory, { useClass: SessionMemory });
  // container.register(WISDOM_TOKENS.memory.sessionMemoryUpdater, { useClass: SessionMemoryUpdater });
  // container.register(WISDOM_TOKENS.memory.sessionMemoryExtractor, { useClass: SessionMemoryExtractor });
  // container.register(WISDOM_TOKENS.memory.sessionMemoryManager, { useClass: SessionMemoryManager });
  // Orchestration
  container.register(WISDOM_TOKENS.orchestrator, { useClass: WisdomOrchestrator });
 
 
  // Application
  container.register(WISDOM_TOKENS.chatUseCase, { useClass: ChatUseCase });
}
