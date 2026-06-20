import { WorldState } from "../state/world-state";

export interface Observation {
  success: boolean;
  data?: any;
  error?: Error;
  metadata?: Record<string, any>;
  newState?: WorldState;
}

export interface ObservationResult {
  observation: Observation;
  updatedContext: { state: WorldState };
}

export interface ObservationContext {
  state: WorldState;
}

export class ObservationLayer {
  observe(
    step: any,
    result: any,
    context: ObservationContext
  ): ObservationResult {
    let observation: Observation;

    if (result instanceof Error) {
      observation = {
        success: false,
        error: result,
        metadata: {
          step: step.action,
          timestamp: new Date().toISOString()
        }
      };
    } else {
      observation = {
        success: true,
        data: result,
        metadata: {
          step: step.action,
          timestamp: new Date().toISOString()
        }
      };
    }

    const updatedContext = { ...context };
    updatedContext.state = { ...context.state };

    return { observation, updatedContext };
  }
}
