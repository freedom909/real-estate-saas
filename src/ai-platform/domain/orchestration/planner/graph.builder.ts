import { WorkflowNode } from "../dependency/workflow.graph";
import { DependencyInfo } from "./dependency.builder";

export class GraphBuilder {
  build(dependencies: DependencyInfo[]): WorkflowNode[] {
    const nodes = new Map<string, WorkflowNode>();

    // First pass: create all nodes
    dependencies.forEach(dep => {
      nodes.set(dep.action, {
        id: dep.action,
        step: { action: dep.action, dependsOn: dep.dependsOn, domain: "", compensation: undefined },
        dependencies: [],
        dependents: []
      });
    });

    // Second pass: build relationships
    dependencies.forEach(dep => {
      const node = nodes.get(dep.action)!;
      dep.dependsOn.forEach(depId => {
        const depNode = nodes.get(depId);
        if (depNode) {
          node.dependencies.push(depNode);
          depNode.dependents.push(node);
        }
      });
    });

    return Array.from(nodes.values());
  }
}
