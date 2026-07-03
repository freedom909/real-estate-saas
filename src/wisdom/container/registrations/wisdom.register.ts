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
import { IntentExtractor } from "../../semantic/extractors/intent.extractor";
import { DateExtractor } from "../../semantic/extractors/date.extractor";
import { LocationExtractor } from "../../semantic/extractors/location.extractor";
import { BookingIdExtractor } from "../../semantic/extractors/booking-id.extractor";
import { ListingExtractor } from "../../semantic/extractors/listing.extractor";
import { GuestExtractor } from "../../semantic/extractors/guest.extractor";

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
import { WisdomPipeline } from "@/wisdom/orchestration/wisdom.pipeline";

import { ResponseStage } from "@/wisdom/orchestration/stage/response.stage";
import { RoutingStage } from "@/wisdom/orchestration/stage/routing.stage";
import { WisdomPipelineContext } from "@/wisdom/orchestration/wisdom-pipeline.context";
import { ExecutionStage } from "@/wisdom/orchestration/stage/execution.stage";
import { SemanticStage } from "@/wisdom/orchestration/stage/semantic.stage";
import { NormalizeIntentStage } from "@/wisdom/orchestration/stage/normalizeIntent.stage";
import { KnowledgeStage } from "@/wisdom/orchestration/stage/knowledge.stage";
import { SummaryStage } from "@/wisdom/orchestration/stage/summary.stage";
import { ReferenceStage } from "@/wisdom/orchestration/stage/reference.stage";

export function registerWisdom() {
  // Infrastructure — OpenAI adapter (used by LLMExtractor and as LLM provider)
  container.register(TOKENS_AI.OpenAITool, { useClass: OpenAITool });
  container.register(TOKENS_AI.usecase.llmProvider, { useClass: OpenAITool });
  console.log("  ✅ OpenAITool registered");

  // Extractors
  container.register(WISDOM_TOKENS.extractors.ruleExtractor, { useClass: RuleExtractor });
  container.register(WISDOM_TOKENS.extractors.messageRuleExtractor, { useClass: MessageRuleExtractor });
  container.register(WISDOM_TOKENS.extractors.llmExtractor, { useClass: LLMExtractor });
  container.register(WISDOM_TOKENS.extractors.intentExtractor, { useClass: IntentExtractor });
  container.register(WISDOM_TOKENS.extractors.dateExtractor, { useClass: DateExtractor });
  container.register(WISDOM_TOKENS.extractors.locationExtractor, { useClass: LocationExtractor });
  container.register(WISDOM_TOKENS.extractors.bookingIdExtractor, { useClass: BookingIdExtractor });
  container.register(WISDOM_TOKENS.extractors.listingExtractor, { useClass: ListingExtractor });
  container.register(WISDOM_TOKENS.extractors.guestExtractor, { useClass: GuestExtractor });

  // Semantic
  container.register(WISDOM_TOKENS.semanticExtractor, { useClass: SemanticExtractor });
  

  // Reference
  container.register(WISDOM_TOKENS.referenceResolver, { useClass: ReferenceResolver });
  container.register(WISDOM_TOKENS.referenceStage, { useClass: ReferenceStage });

  //Execution
   container.register(WISDOM_TOKENS.executionStage, { useClass: ExecutionStage });

  //Response
//  container.register(WISDOM_TOKENS.response, { useClass: ResponseContext });// not found
 
//   //RoutingScheduler
//   container.register(WISDOM_TOKENS.routingScheduler, { useClass: RoutingScheduler });// not found

//stage
  container.register(WISDOM_TOKENS.semanticStage, { useClass: SemanticStage });
  container.register(WISDOM_TOKENS.routingStage, { useClass: RoutingStage });
    //ResponseStage
  container.register(WISDOM_TOKENS.responseStage, { useClass: ResponseStage });
  // Routing
  container.register(WISDOM_TOKENS.router, { useClass: AgentRouter });
  container.register(WISDOM_TOKENS.executionStage, { useClass: ExecutionStage });
  container.register(WISDOM_TOKENS.normalizeIntentStage, { useClass: NormalizeIntentStage });
  container.register(WISDOM_TOKENS.knowledgeStage, { useClass: KnowledgeStage });
  container.register(WISDOM_TOKENS.summaryStage, { useClass: SummaryStage });
  //Resolver
container.register(WISDOM_TOKENS.referenceResolver, { useClass: ReferenceResolver });
 
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
 
  container.register(WISDOM_TOKENS.pipeline, { useClass: WisdomPipeline });
 
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
