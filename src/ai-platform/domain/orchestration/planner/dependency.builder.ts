import { CapabilityRegistry } from "../registry";
import { CapabilityParameter } from "../registry/capability-registry.types";

export interface DependencyInfo {
  action: string;
  dependsOn: string[];
}

interface OutputMapping {
  name: string;
  type: string;
  schema?: string;
  producer: string;
}

export class DependencyBuilder {
  build(actions: string[]): DependencyInfo[] {
    const dependencies: DependencyInfo[] = [];

    // Create a map of outputs to which action produces them (including type/schema info)
    const outputProducers: OutputMapping[] = [];
    actions.forEach(actionId => {
      const entry = CapabilityRegistry[actionId];
      if (entry) {
        entry.outputs.forEach(output => {
          outputProducers.push({
            ...output,
            producer: actionId
          });
        });
      }
    });

    // For each action, find which other actions produce its required inputs
    actions.forEach(actionId => {
      const entry = CapabilityRegistry[actionId];
      if (!entry) {
        throw new Error(`Unknown action: ${actionId}`);
      }

      const dependsOn: string[] = [];
      entry.inputs.forEach(input => {
        // Find matching output by name AND type/schema for better accuracy
        const matchingOutput = outputProducers.find(output => 
          output.name === input.name && 
          output.type === input.type &&
          (!input.schema || output.schema === input.schema) &&
          output.producer !== actionId
        );

        if (matchingOutput && !dependsOn.includes(matchingOutput.producer)) {
          dependsOn.push(matchingOutput.producer);
        }
      });

      dependencies.push({
        action: actionId,
        dependsOn
      });
    });

    return dependencies;
  }
}
