import { WorldState, StateQuery } from "./world-state";

export interface DataSource {
  name: string;
  listEntities(): Promise<string[]>;
  fetch(entity: string, field: string): Promise<any>;
  fetchEntity(entity: string): Promise<Record<string, any>>;
}

export class InMemoryDataSource implements DataSource {
  name = "in-memory";
  private data: Record<string, Record<string, any>> = {};

  setEntityData(entity: string, data: Record<string, any>): void {
    this.data[entity] = { ...this.data[entity], ...data };
  }

  async listEntities(): Promise<string[]> {
    return Object.keys(this.data);
  }

  async fetch(entity: string, field: string): Promise<any> {
    return this.data[entity]?.[field];
  }

  async fetchEntity(entity: string): Promise<Record<string, any>> {
    return { ...this.data[entity] };
  }
}

export class WorldStateObserver {
  private dataSources: Map<string, DataSource> = new Map();
  private cachedState: WorldState = {};
  private lastFetch: number = 0;
  private cacheTtlMs: number = 1000;

  registerDataSource(source: DataSource): void {
    this.dataSources.set(source.name, source);
    console.log(`📡 Registered data source: ${source.name}`);
  }

  async getState(): Promise<WorldState> {
    const now = Date.now();
    if (now - this.lastFetch < this.cacheTtlMs && Object.keys(this.cachedState).length > 0) {
      console.log("🗃️ Returning cached world state");
      return { ...this.cachedState };
    }

    console.log("🌍 Refreshing world state from data sources...");
    const newState: WorldState = {};

    for (const [name, source] of this.dataSources) {
      try {
        const entities = await source.listEntities();
        console.log(`📋 Found entities in ${name}:`, entities);
        
        for (const entity of entities) {
          try {
            const entityData = await source.fetchEntity(entity);
            if (Object.keys(entityData).length > 0) {
              newState[entity] = { ...entityData };
            }
          } catch (error) {
            console.warn(`⚠️ Failed to fetch entity ${entity} from ${name}:`, error);
          }
        }
      } catch (error) {
        console.error(`❌ Failed to list entities from ${name}:`, error);
      }
    }

    this.cachedState = newState;
    this.lastFetch = now;
    console.log("✅ World state refreshed:", JSON.stringify(newState, null, 2));
    return { ...newState };
  }

  async get(query: string | StateQuery): Promise<any> {
    const state = await this.getState();
    if (typeof query === "string") {
      const [entity, field] = query.split(".");
      return state[entity]?.[field];
    }
    return state[query.entity]?.[query.field];
  }

  invalidateCache(): void {
    this.cachedState = {};
    this.lastFetch = 0;
    console.log("🗑️ World state cache invalidated");
  }
}
