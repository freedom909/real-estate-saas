import { inject, injectable } from "tsyringe";
import { IMemoryStore } from "./type/i-memoryStore";
import { ILongTermStore } from "./type/ILongTermStore";
import { IVectorStore } from "./type/IVector.store";
import { WISDOM_TOKENS } from "../container/tokens/wisdom.tokens";
import { MemoryEvent } from "./type/memoryEvent";

type SessionMemory = {
  messages?: any[];
  bookingDraft?: any;
  searchResults?: any[];
};

@injectable()
export class MemoryManager {
  constructor(
    @inject(WISDOM_TOKENS.memory.memoryStore)
    private sessionStore: IMemoryStore,
    @inject(WISDOM_TOKENS.memory.longTermStore)
    private longTermStore: ILongTermStore,
    @inject(WISDOM_TOKENS.memory.vectorStore)
    private vectorStore: IVectorStore
  ) {}

  async load(userId: string) {
    const session = await this.sessionStore.get(userId);
    console.log("session+++", session);
    const longTerm = await this.longTermStore.get(userId);
    const semantic = await this.vectorStore.search({
      userId,
      queryEmbedding: [0],
    });
    return {
      session,
      longTerm,
      semantic,
    };
  }

  async buildPromptContext(memory: any, input: any) {
    return {
      userProfile: memory.longTerm?.preferences,
      recentChat: memory.session?.messages,
      relevantHistory: memory.semantic,
      currentInput: input.message,
    };
  }

  async write(userId: string, event: MemoryEvent) {
    const session: SessionMemory =
      (await this.sessionStore.get(userId)) || {};

    switch (event.type) {
      case "CHAT":
        session.messages = [
          ...(session.messages || []),
          event.payload,
        ];
        break;

      case "BOOKING_DRAFT":
        session.bookingDraft = event.payload;
        break;

      case "SEARCH":
        session.searchResults = event.payload;
        break;
    }

    await this.sessionStore.set(userId, session);
    console.log("session+++++", session);
  }
}