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
  },

  // Orchestration
  orchestrator: Symbol.for("wisdom.orchestrator"),

  // Application
  chatUseCase: Symbol.for("wisdom.chatUseCase"),
} as const;
