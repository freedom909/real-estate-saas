import { ObservationLayer, ObservationResult } from "../observation/observation.layer";
import { ExecutorRegistry } from "../factory/executor.registry";
import { CapabilityRegistryEntry } from "../registry/capability-registry.types";
import { WorldState } from "../state/world-state";
import { StateStore } from "../state/state.store";
import { PlanStep } from "../planner/goal.regression.planner";
import { CapabilityRegistry } from "../registry";

export interface Observation {
  success: boolean;
  data?: any;
  error?: Error;
  metadata?: Record<string, any>;
  newState?: WorldState;
}

export class WorkflowExecutor {
  private observationLayer: ObservationLayer;
  private executorRegistry: ExecutorRegistry;
  private results: Map<string, Observation>;
  private stateStore: StateStore;

  constructor(initialState: WorldState = {}) {
    this.observationLayer = new ObservationLayer();
    this.executorRegistry = new ExecutorRegistry();
    this.results = new Map();
    this.stateStore = new StateStore(initialState);
  }

  getStateStore(): StateStore {
    return this.stateStore;
  }

  getResults(): Map<string, Observation> {
    return this.results;
  }

  getExecutorRegistry(): ExecutorRegistry {
    return this.executorRegistry;
  }

  async executeStep(step: PlanStep): Promise<ObservationResult> {
    console.log(`⏱️ Executing step: ${step.capabilityId}`);
    const capability = step.capability;

    if (capability.riskLevel && ["HIGH", "CRITICAL"].includes(capability.riskLevel)) {
      console.log(`⚠️ High risk action: ${capability.id} (${capability.riskLevel})`);
    }

    try {
      const executor = this.executorRegistry.create(capability.executorId);
      const inputs = this.prepareInputs(capability);
      const result = await this.executeWithTimeout(
        executor,
        inputs,
        capability.timeoutMs
      );

      const observationResult = this.observeAndUpdateState(
        capability,
        result,
        true
      );

      this.results.set(step.capabilityId, observationResult.observation);
      console.log(`✅ Step ${step.capabilityId} completed successfully`);
      return observationResult;
    } catch (error) {
      const observationResult = this.observeAndUpdateState(
        capability,
        error as Error,
        false
      );

      this.results.set(step.capabilityId, observationResult.observation);
      console.log(`❌ Step ${step.capabilityId} failed:`, (error as Error).message);
      return observationResult;
    }
  }

  async executeCompensation(compensationSteps: string[]): Promise<void> {
    console.log("\n🔄 Executing Saga compensation...");
    for (const stepId of compensationSteps.reverse()) {
      const capability = Object.values(CapabilityRegistry).find(c => c.id === stepId);
      if (capability) {
        console.log(`⏪ Compensating: ${stepId}`);
        try {
          const executor = this.executorRegistry.create(capability.executorId);
          await executor.execute();
          console.log(`✅ Compensation completed: ${stepId}`);
        } catch (error) {
          console.error(`❌ Compensation failed: ${stepId}`, error);
        }
      }
    }
  }

  private prepareInputs(capability: CapabilityRegistryEntry): any[] {
    return capability.inputs.map(param => {
      if (param.entity && param.field) {
        return this.stateStore.get({ entity: param.entity, field: param.field });
      }
      return this.stateStore.get(param.name);
    }).filter(input => input !== undefined);
  }

  private async executeWithTimeout(
    executor: any,
    inputs: any[],
    timeoutMs?: number
  ): Promise<any> {
    const timeoutPromise = new Promise((_, reject) => {
      if (timeoutMs) {
        setTimeout(() => reject(new Error("Execution timed out")), timeoutMs);
      }
    });

    const executePromise = executor.execute(...inputs);
    return Promise.race([executePromise, timeoutPromise]);
  }

  private observeAndUpdateState(
    capability: CapabilityRegistryEntry,
    result: any,
    success: boolean
  ): ObservationResult {
    const observationResult = this.observationLayer.observe(
      {
        action: capability.id,
        dependsOn: [],
        compensation: capability.compensation,
        domain: capability.domain,
        description: capability.description,
        inputs: capability.inputs,
        outputs: capability.outputs
      },
      result,
      { state: this.stateStore.getState() }
    );

    if (success) {
      const stateChanges = capability.effects.map(effect => ({
        entity: effect.entity,
        field: effect.field,
        value: effect.value
      }));
      this.stateStore.patch(stateChanges);
      observationResult.observation.newState = this.stateStore.getState();
    }

    return observationResult;
  }
}
