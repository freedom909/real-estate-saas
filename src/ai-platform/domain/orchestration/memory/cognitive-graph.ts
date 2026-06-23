
export enum NodeType {
  CONCEPT = "ConceptNode",
  PREDICATE = "PredicateNode",
  EVALUATION = "EvaluationLink",
  INHERITANCE = "InheritanceLink",
  IMPLICATION = "ImplicationLink",
  EXECUTION = "ExecutionLink",
  LIST = "ListLink",
  NUMBER = "NumberNode",
  STRING = "StringNode",
  VARIABLE = "VariableNode",
  AND = "AndLink",
  OR = "OrLink",
  NOT = "NotLink"
}

export interface Atom {
  id: string;
  type: NodeType;
  name: string;
  truthValue: number;
  confidence: number;
  createdAt: number;
  lastAccessed: number;
  accessCount: number;
}

export interface ConceptNode extends Atom {
  type: NodeType.CONCEPT;
  properties: Record<string, any>;
}

export interface PredicateNode extends Atom {
  type: NodeType.PREDICATE;
  arity: number;
  domain: string[];
  range: string;
}

export interface Link extends Atom {
  type: NodeType;
  arguments: Atom[];
  outgoing: string[]; // 指向的 Atom ID 列表
}

export interface EvaluationLink extends Link {
  type: NodeType.EVALUATION;
  predicate: PredicateNode;
  arguments: Atom[];
  argumentsList: string[];
}

export interface InheritanceLink extends Link {
  type: NodeType.INHERITANCE;
  subClass: Atom;
  superClass: Atom;
}

export interface ImplicationLink extends Link {
  type: NodeType.IMPLICATION;
  premise: Atom;
  conclusion: Atom;
  weight: number;
}

export class CognitiveGraph {
  private atoms: Map<string, Atom> = new Map();
  private index: Map<string, Set<string>> = new Map(); // 类型索引、概念索引等

  addConcept(name: string, truthValue: number = 1.0, confidence: number = 0.8): ConceptNode {
    const id = `concept:${name}:${Date.now()}`;
    const concept: ConceptNode = {
      id,
      type: NodeType.CONCEPT,
      name,
      truthValue,
      confidence,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
      properties: {}
    };

    this.atoms.set(id, concept);
    this.addToIndex(NodeType.CONCEPT, id);
    this.addToIndex(`concept:${name}`, id);

    console.log(`🧠 [Cognitive Graph] Added concept: ${name}`);
    return concept;
  }

  addPredicate(name: string, arity: number, truthValue: number = 1.0): PredicateNode {
    const id = `predicate:${name}:${Date.now()}`;
    const predicate: PredicateNode = {
      id,
      type: NodeType.PREDICATE,
      name,
      truthValue,
      confidence: 0.9,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
      arity,
      domain: [],
      range: "boolean"
    };

    this.atoms.set(id, predicate);
    this.addToIndex(NodeType.PREDICATE, id);
    this.addToIndex(`predicate:${name}`, id);

    console.log(`🧠 [Cognitive Graph] Added predicate: ${name} (arity: ${arity})`);
    return predicate;
  }

  addInheritance(subClass: Atom, superClass: Atom, truthValue: number = 0.95): InheritanceLink {
    const id = `inheritance:${subClass.id}:${superClass.id}:${Date.now()}`;
    const inheritance: InheritanceLink = {
      id,
      type: NodeType.INHERITANCE,
      name: `${subClass.name} → ${superClass.name}`,
      truthValue,
      confidence: 0.85,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
      arguments: [subClass, superClass],
      outgoing: [subClass.id, superClass.id],
      subClass,
      superClass
    };

    this.atoms.set(id, inheritance);
    this.addToIndex(NodeType.INHERITANCE, id);
    this.addToIndex(`isa:${subClass.name}`, id);
    this.addToIndex(`has:${superClass.name}`, id);

    console.log(`🔗 [Cognitive Graph] Added inheritance: ${subClass.name} IS_A ${superClass.name}`);
    return inheritance;
  }

  addImplication(premise: Atom, conclusion: Atom, weight: number = 0.8, truthValue: number = 0.9): ImplicationLink {
    const id = `implication:${Date.now()}:${Math.random().toString(36).substr(2, 6)}`;
    const implication: ImplicationLink = {
      id,
      type: NodeType.IMPLICATION,
      name: `(${premise.name}) → (${conclusion.name})`,
      truthValue,
      confidence: 0.8,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
      arguments: [premise, conclusion],
      outgoing: [premise.id, conclusion.id],
      premise,
      conclusion,
      weight
    };

    this.atoms.set(id, implication);
    this.addToIndex(NodeType.IMPLICATION, id);

    console.log(`🔗 [Cognitive Graph] Added implication: ${premise.name} → ${conclusion.name}`);
    return implication;
  }

  addEvaluation(predicate: PredicateNode, argumentsList: Atom[], truthValue: number = 1.0): EvaluationLink {
    const argNames = argumentsList.map(a => a.name).join(", ");
    const id = `evaluation:${predicate.name}:${Date.now()}`;
    const evaluation: EvaluationLink = {
      id,
      type: NodeType.EVALUATION,
      name: `(${predicate.name} ${argNames})`,
      truthValue,
      confidence: 0.9,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
      arguments: argumentsList,
      outgoing: argumentsList.map(a => a.id),
      predicate,
      argumentsList: argumentsList.map(a => a.id)
    };

    this.atoms.set(id, evaluation);
    this.addToIndex(NodeType.EVALUATION, id);

    console.log(`🔗 [Cognitive Graph] Added evaluation: ${evaluation.name}`);
    return evaluation;
  }

  private addToIndex(key: string | NodeType, atomId: string): void {
    const keyStr = String(key);
    if (!this.index.has(keyStr)) {
      this.index.set(keyStr, new Set());
    }
    this.index.get(keyStr)!.add(atomId);
  }

  getConcept(name: string): ConceptNode | undefined {
    const ids = this.index.get(`concept:${name}`);
    if (!ids || ids.size === 0) return undefined;
    
    const id = Array.from(ids)[0];
    const atom = this.atoms.get(id);
    return atom as ConceptNode;
  }

  getPredicate(name: string): PredicateNode | undefined {
    const ids = this.index.get(`predicate:${name}`);
    if (!ids || ids.size === 0) return undefined;
    
    const id = Array.from(ids)[0];
    const atom = this.atoms.get(id);
    return atom as PredicateNode;
  }

  getInheritanceLinks(subClassName: string): InheritanceLink[] {
    const ids = this.index.get(`isa:${subClassName}`);
    if (!ids) return [];
    
    return Array.from(ids).map(id => this.atoms.get(id) as InheritanceLink);
  }

  query<T extends Atom>(query: Partial<T>): T[] {
    const results: T[] = [];
    for (const atom of this.atoms.values()) {
      let match = true;
      
      // 简单匹配
      if (query.type && atom.type !== query.type) {
        match = false;
      }
      if (query.name && !atom.name.includes(query.name)) {
        match = false;
      }
      
      if (match) {
        atom.lastAccessed = Date.now();
        atom.accessCount++;
        results.push(atom as T);
      }
    }
    return results;
  }

  // 认知推理：演绎推理（Deduction）
  deduce(goal: ConceptNode): Atom[] {
    console.log(`🔍 [Cognitive Graph] Deducing about: ${goal.name}`);
    
    const results: Atom[] = [];
    
    // 寻找所有包含此概念的 InheritanceLinks
    const inheritances = this.query<InheritanceLink>({ type: NodeType.INHERITANCE });
    
    for (const inheritance of inheritances) {
      if (inheritance.subClass.id === goal.id) {
        // 我们是子类，继承超类的属性
        console.log(`    Deduction: ${goal.name} IS_A ${inheritance.superClass.name}`);
        results.push(inheritance.superClass);
      }
    }

    // 寻找所有 ImplicationLinks 可以从当前概念推断
    const implications = this.query<ImplicationLink>({ type: NodeType.IMPLICATION });
    
    for (const implication of implications) {
      if (this.unify(implication.premise, goal)) {
        console.log(`    Deduction: ${goal.name} → ${implication.conclusion.name}`);
        results.push(implication.conclusion);
      }
    }

    return results;
  }

  // 认知推理：溯因推理（Abduction）
  abduct(observation: Atom): Atom[] {
    console.log(`🔍 [Cognitive Graph] Abducing explanation for: ${observation.name}`);
    
    const possibleExplanations: Atom[] = [];
    const implications = this.query<ImplicationLink>({ type: NodeType.IMPLICATION });

    for (const implication of implications) {
      if (this.unify(implication.conclusion, observation)) {
        console.log(`    Abduction: ${implication.premise.name} explains ${observation.name}`);
        possibleExplanations.push(implication.premise);
      }
    }

    return possibleExplanations;
  }

  // 简单统一检查
  private unify(atom1: Atom, atom2: Atom): boolean {
    if (atom1.type !== atom2.type) return false;
    if (atom1.name === atom2.name) return true;
    
    // 检查继承关系
    const inheritances = this.query<InheritanceLink>({ type: NodeType.INHERITANCE });
    for (const inheritance of inheritances) {
      if (inheritance.subClass.name === atom2.name && inheritance.superClass.name === atom1.name) {
        return true;
      }
    }

    return false;
  }

  getGraphSummary(): {
    totalAtoms: number;
    concepts: number;
    predicates: number;
    links: number;
    topConcepts: { name: string; truthValue: number; accessCount: number }[];
  } {
    const conceptNodes = this.query<ConceptNode>({ type: NodeType.CONCEPT });
    const predicateNodes = this.query<PredicateNode>({ type: NodeType.PREDICATE });
    const linkNodes = Array.from(this.atoms.values()).filter(a => 
      [NodeType.INHERITANCE, NodeType.IMPLICATION, NodeType.EVALUATION].includes(a.type)
    );

    const topConcepts = conceptNodes
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 5)
      .map(c => ({ name: c.name, truthValue: c.truthValue, accessCount: c.accessCount }));

    return {
      totalAtoms: this.atoms.size,
      concepts: conceptNodes.length,
      predicates: predicateNodes.length,
      links: linkNodes.length,
      topConcepts
    };
  }
}
