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
import { KnowledgeExtractor, KNOWLEDGE_PLUGIN_TOKEN } from "../../memory/extractor/knowledge.extractor";
import { KnowledgeStore } from "../../memory/knowledge.store";

// Knowledge Plugins
import { PreferencePlugin } from "../../memory/extractor/plugins/preference.plugin";
import { FactPlugin } from "../../memory/extractor/plugins/fact.plugin";
import { GoalPlugin } from "../../memory/extractor/plugins/goal.plugin";
import { BehaviorPlugin } from "../../memory/extractor/plugins/behavior.plugin";

// Delta Handlers
import { PreferenceHandler } from "../../memory/store/handlers/preference.handler";
import { FactHandler } from "../../memory/store/handlers/fact.handler";
import { GoalHandler } from "../../memory/store/handlers/goal.handler";
import { BehaviorHandler } from "../../memory/store/handlers/behavior.handler";
import { SummaryHandler } from "../../memory/store/handlers/summary.handler";

// Summary Pipeline
import { ConversationBuffer } from "../../memory/summary/conversation-buffer";
import { SummaryScheduler } from "../../memory/summary/summary-scheduler";
import { SummaryAgent } from "../../memory/summary/summary-agent";

// Orchestration
import { WisdomOrchestrator } from "../../orchestration/wisdom-orchestrator";

// Application
import { ChatUseCase } from "../../application/usecases/chat.use-case";
import { MemoryStore } from "@/wisdom/memory/memory.store";
import { MemoryManager } from "@/wisdom/memory/memoryManager";
import { LongTermStore } from "@/wisdom/memory/infra/long-term/long-term.store";
import { MemorySessionStore } from "@/wisdom/memory/session/session-memory.store";


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

  // Knowledge Plugins — each registered under the same token, injected as array
  container.register(KNOWLEDGE_PLUGIN_TOKEN, { useClass: PreferencePlugin });
  container.register(KNOWLEDGE_PLUGIN_TOKEN, { useClass: FactPlugin });
  container.register(KNOWLEDGE_PLUGIN_TOKEN, { useClass: GoalPlugin });
  container.register(KNOWLEDGE_PLUGIN_TOKEN, { useClass: BehaviorPlugin });
  console.log("  ✅ Knowledge plugins registered (Preference, Fact, Goal, Behavior)");

  // Delta Handlers — each registered under the same token, injected as array
  container.register(WISDOM_TOKENS.memory.deltaHandlers, { useClass: PreferenceHandler });
  container.register(WISDOM_TOKENS.memory.deltaHandlers, { useClass: FactHandler });
  container.register(WISDOM_TOKENS.memory.deltaHandlers, { useClass: GoalHandler });
  container.register(WISDOM_TOKENS.memory.deltaHandlers, { useClass: BehaviorHandler });
  container.register(WISDOM_TOKENS.memory.deltaHandlers, { useClass: SummaryHandler });
  console.log("  ✅ Delta handlers registered (Preference, Fact, Goal, Behavior, Summary)");

  // Summary Pipeline
  container.register(WISDOM_TOKENS.memory.conversationBuffer, { useClass: ConversationBuffer });
  container.register(WISDOM_TOKENS.memory.summaryAgent, { useClass: SummaryAgent });
  container.register(WISDOM_TOKENS.memory.summaryScheduler, { useClass: SummaryScheduler });
  console.log("  ✅ Summary pipeline registered (Buffer, Agent, Scheduler)");

  // Memory
  container.register(WISDOM_TOKENS.memory.bookingStateUpdater, { useClass: BookingStateUpdater });
  container.register(WISDOM_TOKENS.memory.memoryStore, { useClass: MemoryStore });
  container.register(WISDOM_TOKENS.memory.memoryManager, { useClass: MemoryManager });
  container.register(WISDOM_TOKENS.memory.knowledgeExtractor, { useClass: KnowledgeExtractor });
  container.register(WISDOM_TOKENS.memory.knowledgeStore, { useClass: KnowledgeStore });
  container.register(WISDOM_TOKENS.memory.longTermStore, { useClass: LongTermStore });
  container.registerSingleton(WISDOM_TOKENS.memory.sessionStore, MemorySessionStore);

  // Orchestration
  container.register(WISDOM_TOKENS.orchestrator, { useClass: WisdomOrchestrator });

  // Application
  container.register(WISDOM_TOKENS.chatUseCase, { useClass: ChatUseCase });

  console.log("  ✅ Wisdom DI registered");
}
