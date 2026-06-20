
/**
 * Semantic Graph - 不是真正的 OpenCog AtomSpace，只是一个概念关系图
 * 不叫 Cognitive Graph/OpenCog，避免过度承诺
 */

export enum NodeType {
  CONCEPT = "Concept",
  PREDICATE = "Predicate",
  RELATION = "Relation"
}

export interface GraphNode {
  id: string;
  type: NodeType;
  name: string;
  properties: Record<string, any>;
  confidence: number;
  createdAt: number;
}

export interface GraphEdge {
  id: string;
  type: string;
  from: string;
  to: string;
  weight: number;
  properties: Record<string, any>;
  createdAt: number;
}

export class SemanticGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private incomingEdges: Map<string, Set<string>> = new Map();
  private outgoingEdges: Map<string, Set<string>> = new Map();

  addConcept(name: string, confidence: number = 0.9): GraphNode {
    const id = `concept:${name}:${Date.now()}`;
    const node: GraphNode = {
      id,
      type: NodeType.CONCEPT,
      name,
      properties: {},
      confidence,
      createdAt: Date.now()
    };
    this.nodes.set(id, node);
    return node;
  }

  addRelation(from: string, to: string, type: string, weight: number = 0.8): GraphEdge {
    const id = `edge:${type}:${from}:${to}:${Date.now()}`;
    const edge: GraphEdge = {
      id,
      type,
      from,
      to,
      weight,
      properties: {},
      createdAt: Date.now()
    };

    this.edges.set(id, edge);

    if (!this.outgoingEdges.has(from)) this.outgoingEdges.set(from, new Set());
    this.outgoingEdges.get(from)!.add(id);

    if (!this.incomingEdges.has(to)) this.incomingEdges.set(to, new Set());
    this.incomingEdges.get(to)!.add(id);

    return edge;
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  findConceptByName(name: string): GraphNode | undefined {
    for (const node of this.nodes.values()) {
      if (node.type === NodeType.CONCEPT && node.name === name) {
        return node;
      }
    }
    return undefined;
  }

  getOutgoingEdges(nodeId: string): GraphEdge[] {
    const edgeIds = this.outgoingEdges.get(nodeId);
    if (!edgeIds) return [];
    return Array.from(edgeIds).map(id => this.edges.get(id)!).filter(Boolean);
  }

  getIncomingEdges(nodeId: string): GraphEdge[] {
    const edgeIds = this.incomingEdges.get(nodeId);
    if (!edgeIds) return [];
    return Array.from(edgeIds).map(id => this.edges.get(id)!).filter(Boolean);
  }

  getGraphSummary(): {
    totalNodes: number;
    totalEdges: number;
    topConcepts: Array<{ name: string; confidence: number }>;
  } {
    const concepts = Array.from(this.nodes.values())
      .filter(n => n.type === NodeType.CONCEPT)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)
      .map(n => ({ name: n.name, confidence: n.confidence }));

    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.size,
      topConcepts: concepts
    };
  }
}
