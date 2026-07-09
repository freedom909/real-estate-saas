// src/wisdom/container/tokens/wisdom.tokens.ts

import { KnowledgeStage } from "@/wisdom/orchestration/stage/knowledge.stage";

export const WISDOM_TOKENS = {
  // Semantic
  semanticExtractor: Symbol.for("wisdom.semanticExtractor"),
  semanticParser: Symbol.for("wisdom.semanticParser"),
  semanticStage: Symbol.for("wisdom.semanticStage"),
  normalizeIntentStage: Symbol.for("wisdom.normalizeIntentStage"),
  executionStage: Symbol.for("wisdom.executionStage"),
  responseStage: Symbol.for("wisdom.responseStage"),
  routingStage: Symbol.for("wisdom.routingStage"),
  routingScheduler: Symbol.for("wisdom.routingScheduler"),
  knowledgeStage: Symbol.for("wisdom.knowledgeStage"),
  summaryStage: Symbol.for("wisdom.summaryStage"),
 

  extractors: {
    ruleExtractor: Symbol.for("wisdom.ruleExtractor"),
    messageRuleExtractor: Symbol.for("wisdom.messageRuleExtractor"),
    llmExtractor: Symbol.for("wisdom.llmExtractor"),
    intentExtractor: Symbol.for("wisdom.intentExtractor"),
    dateExtractor: Symbol.for("wisdom.dateExtractor"),
    locationExtractor: Symbol.for("wisdom.locationExtractor"),
    bookingIdExtractor: Symbol.for("wisdom.bookingIdExtractor"),
    listingExtractor: Symbol.for("wisdom.listingExtractor"),
    customerExtractor: Symbol.for("wisdom.customerExtractor"),
  },
  // Pipeline
  pipeline: Symbol.for("wisdom.pipeline"),
  pipelineStage: Symbol.for("PipelineStage"),
  pipelineContext: Symbol.for("PipelineContext"),
  // Reference
  referenceResolver: Symbol.for("wisdom.referenceResolver"),
  //Execution
 
//ResponseStage
 

  response: Symbol.for("wisdom.ctx.response"),
  // Routing
  router: Symbol.for("wisdom.router"),

  // Agents
  agents: {
    listingAgent: Symbol.for("wisdom.listingAgent"),
    bookingAgent: Symbol.for("wisdom.bookingAgent"),
    generalAgent: Symbol.for("wisdom.generalAgent"),
  },

  referenceStage: Symbol.for("wisdom.referenceStage"),

  // Memory
  memory: {
    bookingStateUpdater: Symbol.for("wisdom.bookingStateUpdater"),
    memoryStore: Symbol.for("wisdom.memoryStore"),
    longTermStore: Symbol.for("wisdom.longTermStore"),
    vectorStore: Symbol.for("wisdom.vectorStore"),
    memoryManager: Symbol.for("wisdom.memoryManager"),
    knowledgeExtractor: Symbol.for("wisdom.knowledgeExtractor"),
    knowledgeStore: Symbol.for("wisdom.knowledgeStore"),
    deltaHandlers: Symbol.for("wisdom.deltaHandlers"),
    conversationBuffer: Symbol.for("wisdom.conversationBuffer"),
    summaryScheduler: Symbol.for("wisdom.summaryScheduler"),
    summaryAgent: Symbol.for("wisdom.summaryAgent"),
    sessionMemory: Symbol.for("wisdom.sessionMemory"),
    sessionStore: Symbol.for("wisdom.sessionStore"),
  },

  // Orchestration
  orchestrator: Symbol.for("wisdom.orchestrator"),

  // Application
  chatUseCase: Symbol.for("wisdom.chatUseCase"),
} as const;
