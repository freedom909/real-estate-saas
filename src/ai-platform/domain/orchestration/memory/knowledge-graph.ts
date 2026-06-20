import { WorldState } from "../state/world-state";

export interface EntityNode {
  id: string;
  type: string;
  properties: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface RelationEdge {
  id: string;
  from: string;
  to: string;
  type: string;
  weight: number;
  properties?: Record<string, any>;
  createdAt: number;
  metadata?: any;
}

export interface Pattern {
  id: string;
  type: "temporal" | "causal" | "correlational";
  conditions: string[];
  outcome: string;
  confidence: number;
  frequency: number;
  createdAt: number;
  lastOccurred: number;
}

export class KnowledgeGraph {
  private entities: Map<string, EntityNode> = new Map();
  private relations: Map<string, RelationEdge[]> = new Map();
  private patterns: Map<string, Pattern> = new Map();

  // === 实体操作 ===
  addEntity(id: string, type: string, properties: Record<string, any> = {}): EntityNode {
    const now = Date.now();
    const existing = this.entities.get(id);
    
    if (existing) {
      const updated = {
        ...existing,
        properties: { ...existing.properties, ...properties },
        updatedAt: now
      };
      this.entities.set(id, updated);
      return updated;
    }

    const entity: EntityNode = {
      id,
      type,
      properties,
      createdAt: now,
      updatedAt: now
    };
    this.entities.set(id, entity);
    console.log(`📊 [KnowledgeGraph] Added entity: ${type}:${id}`);
    return entity;
  }

  getEntity(id: string): EntityNode | undefined {
    return this.entities.get(id);
  }

  // === 关系操作 ===
  addRelation(from: string, to: string, type: string, weight: number = 1, properties?: Record<string, any>): RelationEdge {
    const edge: RelationEdge = {
      id: `${from}-${type}-${to}`,
      from,
      to,
      type,
      weight,
      properties,
      createdAt: Date.now()
    };

    if (!this.relations.has(from)) {
      this.relations.set(from, []);
    }
    this.relations.get(from)!.push(edge);

    console.log(`🔗 [KnowledgeGraph] Added relation: ${from} -[${type}]-> ${to}`);
    return edge;
  }

  // === 模式挖掘 ===
  addPattern(pattern: Omit<Pattern, "id" | "createdAt" | "lastOccurred">): Pattern {
    const id = `pattern:${pattern.type}:${pattern.conditions.join('-')}`;
    const existing = this.patterns.get(id);
    
    if (existing) {
      existing.frequency++;
      existing.lastOccurred = Date.now();
      existing.confidence = Math.min(1, existing.confidence + 0.05);
      return existing;
    }

    const newPattern: Pattern = {
      ...pattern,
      id,
      createdAt: Date.now(),
      lastOccurred: Date.now()
    };
    this.patterns.set(id, newPattern);
    
    console.log(`🧩 [KnowledgeGraph] New pattern discovered: ${newPattern.conditions.join(' & ')} → ${newPattern.outcome}`);
    return newPattern;
  }

  getPatternsMatching(conditions: string[]): Pattern[] {
    return Array.from(this.patterns.values())
      .filter(p => {
        return conditions.some(c => p.conditions.includes(c));
      })
      .sort((a, b) => b.confidence - a.confidence);
  }

  // === 查询 ===
  getOutgoingRelations(entityId: string): RelationEdge[] {
    return this.relations.get(entityId) || [];
  }

  findShortestPath(from: string, to: string, relationTypes?: string[]): RelationEdge[] | null {
    // BFS 最短路径
    const queue: { node: string; path: RelationEdge[] }[] = [{ node: from, path: [] }];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { node, path } = queue.shift()!;

      if (node === to) return path;
      if (visited.has(node)) continue;
      visited.add(node);

      const outgoing = this.getOutgoingRelations(node);
      for (const edge of outgoing) {
        if (!relationTypes || relationTypes.includes(edge.type)) {
          queue.push({
            node: edge.to,
            path: [...path, edge]
          });
        }
      }
    }

    return null;
  }

  // === 导出 ===
  getGraphSummary() {
    return {
      entities: this.entities.size,
      relations: Array.from(this.relations.values()).reduce((sum, edges) => sum + edges.length, 0),
      patterns: this.patterns.size,
      topPatterns: Array.from(this.patterns.values())
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5)
    };
  }
}
