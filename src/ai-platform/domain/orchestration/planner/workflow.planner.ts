import { CapabilityRegistry } from "../registry";
import { DependencyBuilder, DependencyInfo } from "./dependency.builder";
import { GraphBuilder } from "./graph.builder";
import { WorkflowGraph, WorkflowNode } from "../graph/workflow.graph";
import { CapabilityParameter } from "../registry/capability-registry.types";

export interface WorkflowStep {
  action: string;
  dependsOn: string[];
  compensation?: string[];
  domain: string;
  description: string;
  inputs: CapabilityParameter[];
  outputs: CapabilityParameter[];
}

export class WorkflowPlanner {
  private dependencyBuilder = new DependencyBuilder();
  private graphBuilder = new GraphBuilder();

  plan(actions: string[]): { steps: WorkflowStep[]; graph: WorkflowNode[]; executionOrder: string[] } {
    // Build steps with registry info
    const steps: WorkflowStep[] = actions.map(action => {
      const entry = CapabilityRegistry[action];
      if (!entry) {
        throw new Error(`Unknown action: ${action}`);
      }
      return {
        action,
        dependsOn: [], // We'll populate this from DependencyBuilder
        compensation: entry.compensation,
        domain: entry.domain,
        description: entry.description,
        inputs: entry.inputs,
        outputs: entry.outputs
      };
    });

    // Auto-derive dependencies
    const dependencies = this.dependencyBuilder.build(actions);

    // Populate dependsOn in steps
    steps.forEach(step => {
      const depInfo = dependencies.find(d => d.action === step.action);
      if (depInfo) {
        step.dependsOn = depInfo.dependsOn;
      }
    });

    // Build graph and get execution order
    const graph = this.graphBuilder.build(dependencies);
    const workflowGraph = new WorkflowGraph();
    // Temporarily rebuild graph in WorkflowGraph to get execution order
    const tempNodes = workflowGraph.build(steps);
    const executionOrder = workflowGraph.getExecutionOrder();

    return { steps, graph, executionOrder };
  }
}
