//src/wisdom/memory/memory.store.ts

import { inject, injectable } from "tsyringe";
import { WISDOM_TOKENS } from "../container/tokens/wisdom.tokens";
import { IMemoryState, IMemoryStore } from "./type/i-memoryStore";

@injectable()
export class MemoryStore implements IMemoryStore {

    private readonly store = new Map<string, IMemoryState>();
     
async get(userId: string): Promise<IMemoryState | null> {
  return this.store.get(userId) ?? null;
}

  async set(userId: string, value: any) {
    this.store.set(userId, value);
  }

  async append(userId: string, key: string, value: any) {
    const current = this.store.get(userId) || {};
      const updated = {
    ...current,
    [key]: value,
  };
    this.store.set(userId, updated);
  }
}