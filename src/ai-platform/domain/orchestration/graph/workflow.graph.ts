import { WorkflowStep } from "../planner/workflow.planner";

export interface WorkflowNode {
  id: string;
  step: WorkflowStep;
  dependencies: WorkflowNode[];
  dependents: WorkflowNode[];
}

export class WorkflowGraph {
  private nodes: Map<string, WorkflowNode> = new Map();

  build(steps: WorkflowStep[]): WorkflowNode[] {
    this.nodes.clear();
    
    // Create all nodes first
    steps.forEach(step => {
      this.nodes.set(step.action, {
        id: step.action,
        step,
        dependencies: [],
        dependents: []
      });
    });

    // Build dependencies
    steps.forEach(step => {
      const node = this.nodes.get(step.action)!;
      step.dependsOn.forEach(depId => {
        const depNode = this.nodes.get(depId);
        if (depNode) {
          node.dependencies.push(depNode);
          depNode.dependents.push(node);
        }
      });
    });

    return Array.from(this.nodes.values());
  }

  getExecutionOrder(): string[] {
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = this.nodes.get(nodeId);
      if (!node) return;

      node.dependencies.forEach(dep => visit(dep.id));
      order.push(nodeId);
    };

    this.nodes.forEach((_, id) => visit(id));
    return order;
  }
}
