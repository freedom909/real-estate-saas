//src/wisdom/memory/memoryStore.ts
export interface IMemoryStore {
  get(userId: string): Promise<IMemoryState | null>;
  set(userId: string, value: IMemoryState): Promise<void>;
  append(userId: string, key: string, value: any): Promise<void>;
}

export interface IMemoryState {
  searchResults?: any[];
  preferences?: Record<string, any>;
  lastQueries?: string[];
  sessionContext?: Record<string, any>;
}