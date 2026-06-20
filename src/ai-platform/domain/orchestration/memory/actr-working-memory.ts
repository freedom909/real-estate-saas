
import { WorldState } from "../state/world-state";

export interface ChunkType {
  name: string;
  slots: string[];
}

export interface Chunk {
  id: string;
  type: ChunkType;
  slots: Record<string, any>;
  activation: number;
  baseLevel: number;
  creationTime: number;
  lastAccessTime: number;
  accessCount: number;
}

export interface RetrievalResult {
  chunk: Chunk;
  activation: number;
  retrievalTime: number;
}

export class ACTRWorkingMemory {
  private chunks: Map<string, Chunk> = new Map();
  private chunkTypes: Map<string, ChunkType> = new Map();
  private decayRate: number = 0.5; // ACT-R 衰减率 d
  private retrievalThreshold: number = 0.0; // ACT-R τ
  private latencyFactor: number = 1.0; // ACT-R F
  
  private static readonly BASE_LEVEL_CONSTANT = 1.0;

  constructor() {
    this.registerDefaultChunkTypes();
  }

  private registerDefaultChunkTypes(): void {
    this.registerChunkType({ name: "Goal", slots: ["state", "target", "entity", "value"] });
    this.registerChunkType({ name: "State", slots: ["entity", "field", "value"] });
    this.registerChunkType({ name: "Service", slots: ["name", "status", "reliability"] });
    this.registerChunkType({ name: "Action", slots: ["name", "preconditions", "effects"] });
  }

  registerChunkType(type: ChunkType): void {
    this.chunkTypes.set(type.name, type);
    console.log(`🧠 [ACT-R] Registered chunk type: ${type.name}`);
  }

  createChunk(typeName: string, slots: Record<string, any>): Chunk {
    const type = this.chunkTypes.get(typeName);
    if (!type) {
      throw new Error(`Unknown chunk type: ${typeName}`);
    }

    const chunk: Chunk = {
      id: `chunk:${typeName}:${Date.now()}:${Math.random().toString(36).substr(2, 6)}`,
      type,
      slots,
      activation: 0,
      baseLevel: 0,
      creationTime: Date.now(),
      lastAccessTime: Date.now(),
      accessCount: 0
    };

    this.chunks.set(chunk.id, chunk);
    console.log(`🧠 [ACT-R] Created chunk: ${typeName} ${JSON.stringify(slots)}`);
    return chunk;
  }

  getChunk(id: string): Chunk | undefined {
    const chunk = this.chunks.get(id);
    if (chunk) {
      this.accessChunk(chunk);
    }
    return chunk;
  }

  private accessChunk(chunk: Chunk): void {
    const now = Date.now();
    chunk.lastAccessTime = now;
    chunk.accessCount++;
    
    // 更新基础激活（ACT-R 的 Base-Level Learning）
    // B_i = ln(Σ t_j^-d)
    chunk.baseLevel = this.calculateBaseLevel(chunk);
    chunk.activation = chunk.baseLevel; // 暂时简化
  }

  private calculateBaseLevel(chunk: Chunk): number {
    // ACT-R Base-Level Learning Equation
    // B_i = ln(Σ_{j=1 to n} t_j^-d)
    // 简化版本：考虑创建时间和访问次数
    const now = Date.now();
    const timeSinceCreation = (now - chunk.creationTime) / 1000;
    const timeSinceLastAccess = (now - chunk.lastAccessTime) / 1000;
    
    // 简化的基础激活计算
    let baseLevel = ACTRWorkingMemory.BASE_LEVEL_CONSTANT;
    
    if (chunk.accessCount > 0) {
      // 每次访问都贡献激活
      baseLevel += Math.log(chunk.accessCount + 1);
    }
    
    // 访问越近，激活越高
    baseLevel -= Math.pow(timeSinceLastAccess, this.decayRate);
    
    return Math.max(baseLevel, 0);
  }

  // ACT-R 检索过程：找出激活最高且超过阈值的 Chunk
  retrieve(spec: Partial<Chunk>): RetrievalResult | null {
    console.log(`🧠 [ACT-R] Retrieving chunks matching: ${JSON.stringify(spec)}`);

    const candidates: { chunk: Chunk; activation: number; matchScore: number }[] = [];

    for (const chunk of this.chunks.values()) {
      // 检查类型匹配
      if (spec.type && spec.type.name !== chunk.type.name) continue;

      // 检查插槽匹配
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
        this.accessChunk(chunk); // 更新激活
        
        const totalActivation = chunk.activation + matchScore;
        candidates.push({ chunk, activation: totalActivation, matchScore });
      }
    }

    if (candidates.length === 0) {
      console.log(`⚠️ [ACT-R] No matching chunks found`);
      return null;
    }

    // 找出激活最高的 Chunk
    candidates.sort((a, b) => b.activation - a.activation);
    const bestMatch = candidates[0];

    // 检查是否超过阈值
    if (bestMatch.activation < this.retrievalThreshold) {
      console.log(`⚠️ [ACT-R] Best match activation (${bestMatch.activation.toFixed(3)}) below threshold (${this.retrievalThreshold})`);
      return null;
    }

    // ACT-R 检索时间方程：RT = F * e^(-A_i)
    const retrievalTime = this.latencyFactor * Math.exp(-bestMatch.activation);

    console.log(`✅ [ACT-R] Retrieved chunk: ${bestMatch.chunk.id}, activation: ${bestMatch.activation.toFixed(3)}, RT: ${retrievalTime.toFixed(3)}s`);

    return {
      chunk: bestMatch.chunk,
      activation: bestMatch.activation,
      retrievalTime
    };
  }

  // 检索多个 Chunks（激活竞争）
  retrieveAll(spec: Partial<Chunk>, limit: number = 5): RetrievalResult[] {
    const allCandidates: RetrievalResult[] = [];

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
        allCandidates.push({
          chunk,
          activation: totalActivation,
          retrievalTime: this.latencyFactor * Math.exp(-totalActivation)
        });
      }
    }

    return allCandidates
      .sort((a, b) => b.activation - a.activation)
      .filter(r => r.activation >= this.retrievalThreshold)
      .slice(0, limit);
  }

  // 从 World State 自动创建 Chunks
  updateFromWorldState(worldState: WorldState): void {
    console.log(`🔄 [ACT-R] Updating working memory from world state`);

    for (const [entity, entityData] of Object.entries(worldState)) {
      for (const [field, value] of Object.entries(entityData)) {
        const stateChunk = this.createChunk("State", {
          entity,
          field,
          value
        });
        this.accessChunk(stateChunk);
      }
    }
  }

  getActivationSummary(): {
    totalChunks: number;
    topActivated: { id: string; type: string; activation: number; slots: any }[];
    averageActivation: number;
  } {
    const chunks = Array.from(this.chunks.values());
    
    if (chunks.length === 0) {
      return { totalChunks: 0, topActivated: [], averageActivation: 0 };
    }

    const sortedChunks = chunks.sort((a, b) => b.activation - a.activation);

    const topActivated = sortedChunks
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        type: c.type.name,
        activation: c.activation,
        slots: c.slots
      }));

    const avgActivation = chunks.reduce((sum, c) => sum + c.activation, 0) / chunks.length;

    return {
      totalChunks: chunks.length,
      topActivated,
      averageActivation
    };
  }
}
