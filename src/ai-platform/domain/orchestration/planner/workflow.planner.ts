import { CapabilityRegistry } from "../CapabilityRegistry";

export interface WorkflowStep {
  action: string;
  dependsOn: string[];
  compensation?: string[];
  domain: string;
}

export class WorkflowPlanner {
  build(actions: string[]): WorkflowStep[] {
    return actions.map(action => {
      const registryEntry = CapabilityRegistry[action];
      if (!registryEntry) {
        throw new Error(`Unknown action: ${action}`);
      }
      return {
        action,
        dependsOn: registryEntry.dependsOn || [],
        compensation: registryEntry.compensation,
        domain: registryEntry.domain
      };
    });
  }
}