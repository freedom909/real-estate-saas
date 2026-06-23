
import { WorldState } from "../state/world-state";

export interface MemoryChunkType {
  name: string;
  slots: string[];
}

export interface MemoryChunk {
  id: string;
  type: MemoryChunkType;
  slots: Record<string, any>;
  activation: number;
  baseLevel: number;
  creationTime: number;
  lastAccessTime: number;
  retrievalHistory: number[];
}

export interface RetrievalResult {
  chunk: MemoryChunk;
  activation: number;
  retrievalTime: number;
}

/**
 * Activation Working Memory - 不是真正的 ACT-R，但有激活和衰减机制
 * 不叫 ACT-R，避免过度承诺
 */
export class ActivationWorkingMemory {
  private chunks: Map<string, MemoryChunk> = new Map();
  private chunkTypes: Map<string, MemoryChunkType> = new Map();
  private decayRate: number = 0.5;
  private retrievalThreshold: number = 0.0;

  constructor() {
    this.registerDefaultChunkTypes();
  }

  private registerDefaultChunkTypes(): void {
    this.registerChunkType({ name: "Goal", slots: ["state", "target", "entity", "value"] });
    this.registerChunkType({ name: "State", slots: ["entity", "field", "value"] });
    this.registerChunkType({ name: "Service", slots: ["name", "status", "reliability"] });
    this.registerChunkType({ name: "Action", slots: ["name", "preconditions", "effects"] });
  }

  registerChunkType(type: MemoryChunkType): void {
    this.chunkTypes.set(type.name, type);
  }

  createChunk(typeName: string, slots: Record<string, any>): MemoryChunk {
    const type = this.chunkTypes.get(typeName);
    if (!type) {
      throw new Error(`Unknown chunk type: ${typeName}`);
    }

    const now = Date.now();
    const chunk: MemoryChunk = {
      id: `chunk:${typeName}:${now}:${Math.random().toString(36).substr(2, 6)}`,
      type,
      slots,
      activation: 1.0,
      baseLevel: 1.0,
      creationTime: now,
      lastAccessTime: now,
      retrievalHistory: [now]
    };

    this.chunks.set(chunk.id, chunk);
    return chunk;
  }

  getChunk(id: string): MemoryChunk | undefined {
    const chunk = this.chunks.get(id);
    if (chunk) {
      this.accessChunk(chunk);
    }
    return chunk;
  }

  private accessChunk(chunk: MemoryChunk): void {
    const now = Date.now();
    chunk.lastAccessTime = now;
    chunk.retrievalHistory.push(now);
    this.updateBaseLevel(chunk);
  }

  private updateBaseLevel(chunk: MemoryChunk): void {
    const now = Date.now();
    let sum = 0;

    for (const retrievalTime of chunk.retrievalHistory) {
      const timeSince = (now - retrievalTime) / 1000;
      sum += Math.pow(Math.max(timeSince, 1), -this.decayRate);
    }

    chunk.baseLevel = sum > 0 ? Math.log(sum) : 0;
    chunk.activation = chunk.baseLevel;
  }

  retrieve(spec: Partial<MemoryChunk>): RetrievalResult | null {
    const candidates: Array<{ chunk: MemoryChunk; activation: number; matchScore: number }> = [];

    for (const chunk of this.chunks.values()) {
      if (spec.type && spec.type.name !== chunk.type.name) continue;

      let matches = true;
      let matchScore = 0;

      if (spec.slots) {
        for (const [slot, value] of Object.entries(spec.slots)) {
          if (chunk.slots[slot] !== value) {
            matches = false;
            break;
          }
          matchScore += 0.1;
        }
      }

      if (matches) {
        this.accessChunk(chunk);
        const totalActivation = chunk.activation + matchScore;
        candidates.push({ chunk, activation: totalActivation, matchScore });
      }
    }

    if (candidates.length === 0) return null;

    candidates.sort((a, b) => b.activation - a.activation);
    const best = candidates[0];

    if (best.activation < this.retrievalThreshold) return null;

    const retrievalTime = 1.0 * Math.exp(-best.activation);

    return { chunk: best.chunk, activation: best.activation, retrievalTime };
  }

  updateFromWorldState(worldState: WorldState): void {
    for (const [entity, entityData] of Object.entries(worldState)) {
      for (const [field, value] of Object.entries(entityData)) {
        this.createChunk("State", { entity, field, value });
      }
    }
  }

  getActivationSummary(): {
    totalChunks: number;
    topActivated: Array<{ id: string; type: string; activation: number; slots: any }>;
    averageActivation: number;
  } {
    const chunks = Array.from(this.chunks.values());
    if (chunks.length === 0) {
      return { totalChunks: 0, topActivated: [], averageActivation: 0 };
    }

    const sortedChunks = chunks.sort((a, b) => b.activation - a.activation);
    const topActivated = sortedChunks.slice(0, 5).map(c => ({
      id: c.id,
      type: c.type.name,
      activation: c.activation,
      slots: c.slots
    }));

    const avgActivation = chunks.reduce((sum, c) => sum + c.activation, 0) / chunks.length;

    return {
      totalChunks: chunks.length,
      topActivated,
      averageActivation: avgActivation
    };
  }
}
