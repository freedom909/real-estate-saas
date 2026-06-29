// src/wisdom/container/tokens/wisdom.tokens.ts

export const WISDOM_TOKENS = {
  // Semantic
  semanticExtractor: Symbol.for("wisdom.semanticExtractor"),

  extractors: {
    ruleExtractor: Symbol.for("wisdom.ruleExtractor"),
    messageRuleExtractor: Symbol.for("wisdom.messageRuleExtractor"),
    llmExtractor: Symbol.for("wisdom.llmExtractor"),
  },

  // Reference
  referenceResolver: Symbol.for("wisdom.referenceResolver"),

  // Routing
  router: Symbol.for("wisdom.router"),

  // Agents
  agents: {
    listingAgent: Symbol.for("wisdom.listingAgent"),
    bookingAgent: Symbol.for("wisdom.bookingAgent"),
    generalAgent: Symbol.for("wisdom.generalAgent"),
  },

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
